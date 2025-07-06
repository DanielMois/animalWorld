const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Realizar sorteio (rota protegida - admin)
router.post('/realizar', adminMiddleware, async (req, res) => {
  try {
    const { modalidade, data_sorteio } = req.body;

    if (!modalidade || !data_sorteio) {
      return res.status(400).json({ message: 'Modalidade e data são obrigatórios' });
    }

    if (!['dezena', 'centena', 'milhar'].includes(modalidade)) {
      return res.status(400).json({ message: 'Modalidade inválida' });
    }

    // Verificar se já existe sorteio para esta modalidade e data
    const [sorteiosExistentes] = await pool.execute(
      'SELECT id FROM sorteio WHERE modalidade = ? AND data_sorteio = ?',
      [modalidade, data_sorteio]
    );

    if (sorteiosExistentes.length > 0) {
      return res.status(400).json({ message: 'Sorteio já realizado para esta modalidade e data' });
    }

    // Gerar número sorteado
    let numeroSorteado;
    switch (modalidade) {
      case 'dezena':
        numeroSorteado = Math.floor(Math.random() * 99) + 1;
        numeroSorteado = numeroSorteado.toString().padStart(2, '0');
        break;
      case 'centena':
        numeroSorteado = Math.floor(Math.random() * 999) + 1;
        numeroSorteado = numeroSorteado.toString().padStart(3, '0');
        break;
      case 'milhar':
        numeroSorteado = Math.floor(Math.random() * 9999) + 1;
        numeroSorteado = numeroSorteado.toString().padStart(4, '0');
        break;
    }

    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Registrar sorteio
      const [result] = await connection.execute(
        'INSERT INTO sorteio (modalidade, data_sorteio, numero_sorteado) VALUES (?, ?, ?)',
        [modalidade, data_sorteio, numeroSorteado]
      );

      const sorteioId = result.insertId;

      // Buscar apostas vencedoras
      const [apostasVencedoras] = await connection.execute(
        'SELECT id, usuario_id, pontos_apostados FROM aposta WHERE modalidade = ? AND numero_apostado = ? AND data_aposta = ?',
        [modalidade, numeroSorteado, data_sorteio]
      );

      // Calcular multiplicadores
      let multiplicador;
      switch (modalidade) {
        case 'dezena':
          multiplicador = 20;
          break;
        case 'centena':
          multiplicador = 400;
          break;
        case 'milhar':
          multiplicador = 4000;
          break;
      }

      // Processar vencedores
      for (const aposta of apostasVencedoras) {
        const pontosPremiados = aposta.pontos_apostados * multiplicador;

        // Registrar resultado
        await connection.execute(
          'INSERT INTO resultado_aposta (aposta_id, sorteio_id, vencedor, pontos_premiados) VALUES (?, ?, 1, ?)',
          [aposta.id, sorteioId, pontosPremiados]
        );

        // Adicionar pontos ao usuário
        await connection.execute(
          'UPDATE usuario SET saldo_pontos = saldo_pontos + ? WHERE id = ?',
          [pontosPremiados, aposta.usuario_id]
        );
      }

      // Registrar apostas não vencedoras
      const [todasApostas] = await connection.execute(
        'SELECT id FROM aposta WHERE modalidade = ? AND data_aposta = ? AND numero_apostado != ?',
        [modalidade, data_sorteio, numeroSorteado]
      );

      for (const aposta of todasApostas) {
        await connection.execute(
          'INSERT INTO resultado_aposta (aposta_id, sorteio_id, vencedor, pontos_premiados) VALUES (?, ?, 0, 0)',
          [aposta.id, sorteioId]
        );
      }

      await connection.commit();

      res.status(201).json({
        message: 'Sorteio realizado com sucesso',
        sorteio: {
          id: sorteioId,
          modalidade,
          data_sorteio,
          numero_sorteado: numeroSorteado,
          vencedores: apostasVencedoras.length
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao realizar sorteio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter resultados de sorteios
router.get('/resultados', async (req, res) => {
  try {
    const { modalidade, data } = req.query;

    let query = `
      SELECT s.*, 
             COUNT(CASE WHEN ra.vencedor = 1 THEN 1 END) as total_vencedores,
             SUM(CASE WHEN ra.vencedor = 1 THEN ra.pontos_premiados ELSE 0 END) as total_premiado
      FROM sorteio s
      LEFT JOIN resultado_aposta ra ON s.id = ra.sorteio_id
    `;
    let params = [];

    if (modalidade) {
      query += ' WHERE s.modalidade = ?';
      params.push(modalidade);
    }

    if (data) {
      if (modalidade) {
        query += ' AND s.data_sorteio = ?';
      } else {
        query += ' WHERE s.data_sorteio = ?';
      }
      params.push(data);
    }

    query += ' GROUP BY s.id ORDER BY s.data_sorteio DESC, s.modalidade';

    const [sorteios] = await pool.execute(query, params);

    res.json({ sorteios });

  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter resultado específico de um sorteio
router.get('/resultado/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar sorteio
    const [sorteios] = await pool.execute(
      'SELECT * FROM sorteio WHERE id = ?',
      [id]
    );

    if (sorteios.length === 0) {
      return res.status(404).json({ message: 'Sorteio não encontrado' });
    }

    const sorteio = sorteios[0];

    // Buscar vencedores
    const [vencedores] = await pool.execute(`
      SELECT u.login, a.pontos_apostados, ra.pontos_premiados
      FROM resultado_aposta ra
      JOIN aposta a ON ra.aposta_id = a.id
      JOIN usuario u ON a.usuario_id = u.id
      WHERE ra.sorteio_id = ? AND ra.vencedor = 1
    `, [id]);

    res.json({
      sorteio,
      vencedores,
      total_vencedores: vencedores.length
    });

  } catch (error) {
    console.error('Erro ao buscar resultado específico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar se sorteio do dia já foi realizado
router.get('/status-hoje', async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const modalidades = ['dezena', 'centena', 'milhar'];

    const status = {};

    for (const modalidade of modalidades) {
      const [sorteios] = await pool.execute(
        'SELECT id, numero_sorteado FROM sorteio WHERE modalidade = ? AND data_sorteio = ?',
        [modalidade, hoje]
      );

      status[modalidade] = {
        realizado: sorteios.length > 0,
        numero_sorteado: sorteios.length > 0 ? sorteios[0].numero_sorteado : null
      };
    }

    res.json({ status, data: hoje });

  } catch (error) {
    console.error('Erro ao verificar status dos sorteios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 