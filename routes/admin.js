const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login de administrador
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ message: 'Login e senha são obrigatórios' });
    }

    // Buscar admin
    const [admins] = await pool.execute(
      'SELECT id, login, senha_hash FROM admin WHERE login = ?',
      [login]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Login ou senha inválidos' });
    }

    const admin = admins[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Login ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        login: admin.login, 
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login de administrador realizado com sucesso',
      token,
      admin: {
        id: admin.id,
        login: admin.login
      }
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Dashboard de KPIs (rota protegida)
router.get('/dashboard', adminMiddleware, async (req, res) => {
  try {
    // Total de apostas realizadas
    const [totalApostas] = await pool.execute(
      'SELECT COUNT(*) as total FROM aposta'
    );

    // Lucro Total (soma de todas as apostas menos prêmios pagos)
    const [lucroTotal] = await pool.execute(`
      SELECT 
        COALESCE(SUM(a.pontos_apostados), 0) as total_apostado,
        COALESCE(SUM(ra.pontos_premiados), 0) as total_premiado
      FROM aposta a
      LEFT JOIN resultado_aposta ra ON a.id = ra.aposta_id
    `);

    // Sorteios realizados
    const [sorteiosRealizados] = await pool.execute(
      'SELECT COUNT(*) as total FROM sorteio'
    );

    // Total de vencedores por modalidade
    const [vencedoresPorModalidade] = await pool.execute(`
      SELECT 
        a.modalidade,
        COUNT(*) as total_vencedores
      FROM aposta a
      JOIN resultado_aposta ra ON a.id = ra.aposta_id
      WHERE ra.vencedor = 1
      GROUP BY a.modalidade
    `);

    // Usuários registrados
    const [totalUsuarios] = await pool.execute(
      'SELECT COUNT(*) as total FROM usuario'
    );

    const lucro = lucroTotal[0].total_apostado - lucroTotal[0].total_premiado;

    res.json({
      kpis: {
        total_apostas: totalApostas[0].total,
        lucro_total: lucro,
        sorteios_realizados: sorteiosRealizados[0].total,
        total_usuarios: totalUsuarios[0].total,
        vencedores_por_modalidade: vencedoresPorModalidade
      }
    });

  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 