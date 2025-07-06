const express = require('express');
const nanoService = require('../services/nanoService');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Gerar nova carteira Nano para o usuário
router.post('/gerar-carteira', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar se usuário já tem carteira
    const [existingWallet] = await pool.execute(
      'SELECT carteira_nano FROM usuario WHERE id = ?',
      [userId]
    );

    if (existingWallet[0].carteira_nano) {
      return res.status(400).json({ 
        message: 'Usuário já possui uma carteira Nano' 
      });
    }

    // Gerar nova carteira
    const wallet = await nanoService.generateWallet();
    
    // Salvar carteira no banco (apenas o endereço público)
    await pool.execute(
      'UPDATE usuario SET carteira_nano = ? WHERE id = ?',
      [wallet.address, userId]
    );

    res.json({
      message: 'Carteira Nano gerada com sucesso',
      address: wallet.address,
      publicKey: wallet.publicKey
    });

  } catch (error) {
    console.error('Erro ao gerar carteira:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter saldo da carteira Nano
router.get('/saldo', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar carteira do usuário
    const [user] = await pool.execute(
      'SELECT carteira_nano FROM usuario WHERE id = ?',
      [userId]
    );

    if (!user[0].carteira_nano) {
      return res.status(404).json({ 
        message: 'Carteira Nano não encontrada' 
      });
    }

    const balance = await nanoService.getBalance(user[0].carteira_nano);
    
    res.json({
      address: user[0].carteira_nano,
      balance: balance,
      balanceRaw: nanoService.convertToRaw(balance, 'NANO')
    });

  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Converter pontos para Nano (depósito)
router.post('/depositar', authMiddleware, async (req, res) => {
  try {
    const { pontos, carteira_destino } = req.body;
    const userId = req.user.id;

    if (!pontos || !carteira_destino) {
      return res.status(400).json({ 
        message: 'Pontos e carteira de destino são obrigatórios' 
      });
    }

    if (pontos <= 0) {
      return res.status(400).json({ 
        message: 'Quantidade de pontos deve ser maior que zero' 
      });
    }

    // Verificar se usuário tem pontos suficientes
    const [user] = await pool.execute(
      'SELECT saldo_pontos FROM usuario WHERE id = ?',
      [userId]
    );

    if (user[0].saldo_pontos < pontos) {
      return res.status(400).json({ 
        message: 'Saldo de pontos insuficiente' 
      });
    }

    // Taxa de conversão: 1 ponto = 0.001 NANO
    const nanoAmount = pontos * 0.001;

    // Validar endereço de destino
    if (!nanoService.validateAddress(carteira_destino)) {
      return res.status(400).json({ 
        message: 'Endereço Nano inválido' 
      });
    }

    // Buscar carteira do sistema para envio
    const [systemWallet] = await pool.execute(
      'SELECT endereco_nano FROM carteira_sistema WHERE nome = ?',
      ['carteira-bolsa']
    );

    if (!systemWallet[0]) {
      return res.status(500).json({ 
        message: 'Carteira do sistema não configurada' 
      });
    }

    // Processar transação (simulado para demonstração)
    // Em produção, você precisaria da chave privada da carteira do sistema
    const transaction = {
      hash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: nanoAmount,
      from: systemWallet[0].endereco_nano,
      to: carteira_destino,
      timestamp: Date.now()
    };

    // Deduzir pontos do usuário
    await pool.execute(
      'UPDATE usuario SET saldo_pontos = saldo_pontos - ? WHERE id = ?',
      [pontos, userId]
    );

    // Registrar transação
    await pool.execute(
      'INSERT INTO transacao (usuario_id, tipo, pontos, carteira_nano, hash_transacao, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'deposito', pontos, carteira_destino, transaction.hash, 'confirmado']
    );

    res.json({
      message: 'Depósito processado com sucesso',
      transaction: transaction,
      pontosConvertidos: pontos,
      nanoEnviado: nanoAmount
    });

  } catch (error) {
    console.error('Erro ao processar depósito:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Sacar Nano para pontos (retirada)
router.post('/sacar', authMiddleware, async (req, res) => {
  try {
    const { nanoAmount, carteira_origem } = req.body;
    const userId = req.user.id;

    if (!nanoAmount || !carteira_origem) {
      return res.status(400).json({ 
        message: 'Quantidade de Nano e carteira de origem são obrigatórios' 
      });
    }

    if (nanoAmount <= 0) {
      return res.status(400).json({ 
        message: 'Quantidade de Nano deve ser maior que zero' 
      });
    }

    // Validar endereço de origem
    if (!nanoService.validateAddress(carteira_origem)) {
      return res.status(400).json({ 
        message: 'Endereço Nano inválido' 
      });
    }

    // Taxa de conversão: 1 NANO = 1000 pontos
    const pontos = Math.floor(nanoAmount * 1000);

    // Buscar carteira do sistema para recebimento
    const [systemWallet] = await pool.execute(
      'SELECT endereco_nano FROM carteira_sistema WHERE nome = ?',
      ['carteira-bolsa']
    );

    if (!systemWallet[0]) {
      return res.status(500).json({ 
        message: 'Carteira do sistema não configurada' 
      });
    }

    // Gerar QR Code para pagamento
    const paymentQR = nanoService.generatePaymentQR(
      systemWallet[0].endereco_nano, 
      nanoAmount
    );

    // Registrar transação pendente
    const [result] = await pool.execute(
      'INSERT INTO transacao (usuario_id, tipo, pontos, carteira_nano, status) VALUES (?, ?, ?, ?, ?)',
      [userId, 'saque', pontos, carteira_origem, 'pendente']
    );

    res.json({
      message: 'Solicitação de saque criada',
      paymentQR: paymentQR,
      transactionId: result.insertId,
      pontosRecebidos: pontos,
      nanoSolicitado: nanoAmount,
      instrucoes: 'Escaneie o QR Code ou copie o endereço para enviar o pagamento'
    });

  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar status de transação
router.get('/transacao/:hash', authMiddleware, async (req, res) => {
  try {
    const { hash } = req.params;
    const userId = req.user.id;

    // Buscar transação no banco
    const [transaction] = await pool.execute(
      'SELECT * FROM transacao WHERE hash_transacao = ? AND usuario_id = ?',
      [hash, userId]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ 
        message: 'Transação não encontrada' 
      });
    }

    // Verificar confirmação na blockchain (simulado)
    const isConfirmed = await nanoService.isTransactionConfirmed(hash);

    res.json({
      transaction: transaction[0],
      confirmed: isConfirmed,
      status: isConfirmed ? 'confirmado' : 'pendente'
    });

  } catch (error) {
    console.error('Erro ao verificar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar transações do usuário
router.get('/transacoes', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [transactions] = await pool.execute(
      'SELECT * FROM transacao WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 50',
      [userId]
    );

    res.json({
      transactions: transactions
    });

  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Validar endereço Nano
router.post('/validar-endereco', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        message: 'Endereço é obrigatório' 
      });
    }

    const isValid = nanoService.validateAddress(address);

    res.json({
      address: address,
      valid: isValid
    });

  } catch (error) {
    console.error('Erro ao validar endereço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 