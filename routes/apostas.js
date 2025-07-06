const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Fazer aposta
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { modalidade, numero_apostado, pontos_apostados } = req.body;
    const userId = req.user.id;

    // Validações básicas
    if (!modalidade || !numero_apostado || !pontos_apostados) {
      return res.status(400).json({ message: 'Modalidade, número e pontos são obrigatórios' });
    }

    // Validar modalidade
    if (!['dezena', 'centena', 'milhar'].includes(modalidade)) {
      return res.status(400).json({ message: 'Modalidade inválida' });
    }

    // Validar número conforme modalidade
    let numeroValido = false;
    switch (modalidade) {
      case 'dezena':
        numeroValido = /^[0-9]{2}$/.test(numero_apostado) && parseInt(numero_apostado) >= 1 && parseInt(numero_apostado) <= 99;
        break;
      case 'centena':
        numeroValido = /^[0-9]{3}$/.test(numero_apostado) && parseInt(numero_apostado) >= 1 && parseInt(numero_apostado) <= 999;
        break;
      case 'milhar':
        numeroValido = /^[0-9]{4}$/.test(numero_apostado) && parseInt(numero_apostado) >= 1 && parseInt(numero_apostado) <= 9999;
        break;
    }

    if (!numeroValido) {
      return res.status(400).json({ message: 'Número inválido para a modalidade' });
    }

    // Validar horário (apostas permitidas entre 9h e 17h)
    const agora = new Date();
    const hora = agora.getHours();
    if (hora < 9 || hora >= 17) {
      return res.status(400).json({ message: 'Apostas permitidas apenas entre 9h e 17h' });
    }

    // Verificar saldo do usuário
    const [users] = await pool.execute(
      'SELECT saldo_pontos FROM usuario WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const saldoAtual = users[0].saldo_pontos;
    if (saldoAtual < pontos_apostados) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    // Verificar limite de pontos por número
    const dataHoje = agora.toISOString().split('T')[0];
    const [apostasExistentes] = await pool.execute(
      'SELECT SUM(pontos_apostados) as total FROM aposta WHERE modalidade = ? AND numero_apostado = ? AND data_aposta = ?',
      [modalidade, numero_apostado, dataHoje]
    );

    const totalApostado = apostasExistentes[0].total || 0;
    let limiteModalidade;
    
    switch (modalidade) {
      case 'dezena':
        limiteModalidade = 10;
        break;
      case 'centena':
        limiteModalidade = 30;
        break;
      case 'milhar':
        limiteModalidade = 50;
        break;
    }

    if (totalApostado + pontos_apostados > limiteModalidade) {
      const pontosDisponiveis = limiteModalidade - totalApostado;
      return res.status(400).json({ 
        message: `Limite excedido para este número. Máximo disponível: ${pontosDisponiveis} pontos` 
      });
    }

    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Deduzir pontos do usuário
      await connection.execute(
        'UPDATE usuario SET saldo_pontos = saldo_pontos - ? WHERE id = ?',
        [pontos_apostados, userId]
      );

      // Registrar aposta
      const [result] = await connection.execute(
        'INSERT INTO aposta (usuario_id, modalidade, numero_apostado, pontos_apostados, data_aposta) VALUES (?, ?, ?, ?, ?)',
        [userId, modalidade, numero_apostado, pontos_apostados, dataHoje]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Aposta realizada com sucesso',
        aposta: {
          id: result.insertId,
          modalidade,
          numero_apostado,
          pontos_apostados,
          data_aposta: dataHoje
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao fazer aposta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar apostas do usuário
router.get('/minhas', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data } = req.query;

    let query = `
      SELECT a.*, s.numero_sorteado, ra.vencedor, ra.pontos_premiados
      FROM aposta a
      LEFT JOIN sorteio s ON a.modalidade = s.modalidade AND a.data_aposta = s.data_sorteio
      LEFT JOIN resultado_aposta ra ON a.id = ra.aposta_id
      WHERE a.usuario_id = ?
    `;
    let params = [userId];

    if (data) {
      query += ' AND a.data_aposta = ?';
      params.push(data);
    }

    query += ' ORDER BY a.criado_em DESC';

    const [apostas] = await pool.execute(query, params);

    res.json({ apostas });

  } catch (error) {
    console.error('Erro ao listar apostas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter pontos disponíveis para um número
router.get('/pontos-disponiveis/:modalidade/:numero', authMiddleware, async (req, res) => {
  try {
    const { modalidade, numero } = req.params;
    const dataHoje = new Date().toISOString().split('T')[0];

    // Validar modalidade
    if (!['dezena', 'centena', 'milhar'].includes(modalidade)) {
      return res.status(400).json({ message: 'Modalidade inválida' });
    }

    // Obter limite da modalidade
    let limiteModalidade;
    switch (modalidade) {
      case 'dezena':
        limiteModalidade = 10;
        break;
      case 'centena':
        limiteModalidade = 30;
        break;
      case 'milhar':
        limiteModalidade = 50;
        break;
    }

    // Calcular pontos já apostados
    const [apostasExistentes] = await pool.execute(
      'SELECT SUM(pontos_apostados) as total FROM aposta WHERE modalidade = ? AND numero_apostado = ? AND data_aposta = ?',
      [modalidade, numero, dataHoje]
    );

    const pontosApostados = apostasExistentes[0].total || 0;
    const pontosDisponiveis = limiteModalidade - pontosApostados;

    res.json({
      modalidade,
      numero,
      pontos_apostados: pontosApostados,
      pontos_disponiveis: Math.max(0, pontosDisponiveis),
      limite_modalidade: limiteModalidade
    });

  } catch (error) {
    console.error('Erro ao calcular pontos disponíveis:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 