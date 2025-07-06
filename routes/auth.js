const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const NanoService = require('../services/nanoService');

const router = express.Router();

// Registro de usuário com carteira Nano
router.post('/registro', async (req, res) => {
  try {
    const { login, carteira_nano, isVerification } = req.body;

    // Validações básicas
    if (!login || !carteira_nano) {
      return res.status(400).json({ message: 'Login e carteira Nano são obrigatórios' });
    }

    // Validar formato da carteira Nano
    if (!carteira_nano.startsWith('nano_') || carteira_nano.length !== 65) {
      return res.status(400).json({ message: 'Carteira Nano inválida' });
    }

    // Verificar se o login já existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuario WHERE login = ?',
      [login]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Login já existe' });
    }

    // Verificar se a carteira Nano já está em uso
    const [existingWallets] = await pool.execute(
      'SELECT id FROM usuario WHERE carteira_nano = ?',
      [carteira_nano]
    );

    if (existingWallets.length > 0) {
      return res.status(400).json({ message: 'Carteira Nano já está em uso' });
    }

    if (isVerification) {
      // Verificar se o pagamento de verificação foi feito
      const verificationResult = await NanoService.verifyWalletOwnership(carteira_nano);
      
      if (!verificationResult.verified) {
        return res.status(400).json({ 
          message: 'Carteira Nano não verificada. Faça o pagamento de verificação primeiro.' 
        });
      }

      // Inserir usuário verificado com saldo inicial de 100 pontos
      const [result] = await pool.execute(
        'INSERT INTO usuario (login, carteira_nano, saldo_pontos, carteira_verificada) VALUES (?, ?, 100, 1)',
        [login, carteira_nano]
      );

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: result.insertId, 
          login, 
          isAdmin: false 
        },
        process.env.JWT_SECRET || 'sua_chave_secreta',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        user: {
          id: result.insertId,
          login,
          saldo_pontos: 100,
          carteira_nano
        }
      });
    } else {
      // Primeira tentativa de registro - gerar endereço para verificação
      const verificationAddress = await NanoService.getVerificationAddress();
      const verificationAmount = '0.001'; // 0.001 Nano para verificação
      const verificationMessage = `Verificação AnimalWorld - ${login}`;

      res.status(200).json({
        requiresVerification: true,
        verificationAddress,
        verificationAmount,
        verificationMessage,
        message: 'Carteira Nano requer verificação'
      });
    }

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login de usuário com carteira Nano
router.post('/login', async (req, res) => {
  try {
    const { login, carteira_nano, isVerification } = req.body;

    if (!login || !carteira_nano) {
      return res.status(400).json({ message: 'Login e carteira Nano são obrigatórios' });
    }

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id, login, carteira_nano, saldo_pontos, carteira_verificada FROM usuario WHERE login = ?',
      [login]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Login ou carteira Nano inválidos' });
    }

    const user = users[0];

    // Verificar se a carteira Nano corresponde
    if (user.carteira_nano !== carteira_nano) {
      return res.status(401).json({ message: 'Login ou carteira Nano inválidos' });
    }

    if (isVerification) {
      // Verificar se o pagamento de verificação foi feito
      const verificationResult = await NanoService.verifyWalletOwnership(carteira_nano);
      
      if (!verificationResult.verified) {
        return res.status(400).json({ 
          message: 'Carteira Nano não verificada. Faça o pagamento de verificação primeiro.' 
        });
      }

      // Marcar carteira como verificada se ainda não estiver
      if (!user.carteira_verificada) {
        await pool.execute(
          'UPDATE usuario SET carteira_verificada = 1 WHERE id = ?',
          [user.id]
        );
      }
    } else if (!user.carteira_verificada) {
      // Se a carteira não está verificada, solicitar verificação
      const verificationAddress = await NanoService.getVerificationAddress();
      const verificationAmount = '0.001';
      const verificationMessage = `Verificação AnimalWorld - ${login}`;

      return res.status(200).json({
        requiresVerification: true,
        verificationAddress,
        verificationAmount,
        verificationMessage,
        message: 'Carteira Nano requer verificação'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        login: user.login, 
        isAdmin: false 
      },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        login: user.login,
        saldo_pontos: user.saldo_pontos,
        carteira_nano: user.carteira_nano
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário (rota protegida)
router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, login, saldo_pontos, carteira_nano, carteira_verificada, criado_em FROM usuario WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 