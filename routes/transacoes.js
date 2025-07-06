const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const NanoService = require('../services/nanoService');

const router = express.Router();

// Obter carteiras do sistema das variáveis de ambiente
const getSystemWallets = () => {
  return {
    'carteira-bolsa': process.env.NANO_BOLSA_ADDRESS || 'nano_3bolsa123456789abcdefghijklmnopqrstuvwxyz',
    'carteira-lucro': process.env.NANO_LUCRO_ADDRESS || 'nano_3lucro123456789abcdefghijklmnopqrstuvwxyz'
  };
};

// Comprar pontos via Nano
router.post('/comprar-pontos', authMiddleware, async (req, res) => {
  try {
    const { valor_pontos } = req.body;
    const userId = req.user.id;

    if (!valor_pontos || parseFloat(valor_pontos) <= 0) {
      return res.status(400).json({ message: 'Valor deve ser maior que zero' });
    }

    // Converter para float para garantir precisão decimal
    const pontosFloat = parseFloat(valor_pontos);

    // ===============================
    // ENDEREÇO NANO FIXO PARA PAGAMENTO
    // Agora obtido das variáveis de ambiente
    const paymentAddress = await NanoService.getPaymentAddress();
    // ===============================

    // Converter pontos para Nano (1 ponto = 1 Nano)
    const nanoAmount = pontosFloat;
    const transactionId = `compra_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentMessage = `Compra AnimalWorld - ${pontosFloat} pontos - ${transactionId}`;

    // Registrar transação pendente
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO transacao (usuario_id, tipo, valor_pontos, valor_nano, txid_nano, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, 'compra', pontosFloat, nanoAmount, transactionId, 'pendente', JSON.stringify({
          paymentAddress,
          paymentMessage,
          createdAt: new Date().toISOString()
        })]
      );

      await connection.commit();

      res.status(200).json({
        message: 'Solicitação de compra criada',
        transactionId,
        paymentAddress,
        nanoAmount,
        paymentMessage,
        valor_pontos: pontosFloat
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao processar compra de pontos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar pagamento de compra de pontos
router.post('/verificar-pagamento', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'ID da transação é obrigatório' });
    }

    // Buscar transação
    const [transacoes] = await pool.execute(
      'SELECT * FROM transacao WHERE txid_nano = ? AND usuario_id = ? AND tipo = ?',
      [transactionId, userId, 'compra']
    );

    if (transacoes.length === 0) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    const transacao = transacoes[0];
    
    if (transacao.status === 'confirmado') {
      return res.json({ confirmed: true, message: 'Pagamento já foi confirmado' });
    }

    // Verificar se o pagamento foi feito usando a nova função
    const metadata = JSON.parse(transacao.metadata || '{}');
    const paymentAddress = metadata.paymentAddress;
    const expectedAmount = parseFloat(transacao.valor_nano);
    
    // Usar a nova função de verificação de pagamento
    const paymentResult = await NanoService.checkPaymentReceived(paymentAddress, expectedAmount);
    
    if (paymentResult.received) {
      // Pagamento confirmado - processar compra
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Atualizar status da transação
        await connection.execute(
          'UPDATE transacao SET status = ? WHERE id = ?',
          ['confirmado', transacao.id]
        );

        // Adicionar pontos ao usuário (usando parseFloat para garantir precisão)
        const pontosParaAdicionar = parseFloat(transacao.valor_pontos);
        await connection.execute(
          'UPDATE usuario SET saldo_pontos = saldo_pontos + ? WHERE id = ?',
          [pontosParaAdicionar, userId]
        );

        await connection.commit();

        res.json({
          confirmed: true,
          message: 'Pagamento confirmado! Seus pontos foram creditados.',
          pontos_creditados: pontosParaAdicionar,
          simulation: paymentResult.simulation
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      res.json({
        confirmed: false,
        message: 'Pagamento ainda não foi confirmado. Aguarde a confirmação da rede Nano.'
      });
    }

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar depósito
router.post('/deposito', authMiddleware, async (req, res) => {
  try {
    const { valor_nano } = req.body;
    const userId = req.user.id;

    if (!valor_nano || valor_nano <= 0) {
      return res.status(400).json({ message: 'Valor em Nano deve ser maior que zero' });
    }

    // Converter Nano para pontos (1 Nano = 1 ponto)
    const pontos = Math.floor(valor_nano);

    // Calcular distribuição 85%/15%
    const valorBolsa = valor_nano * 0.85;
    const valorLucro = valor_nano * 0.15;

    // Obter carteiras do sistema das variáveis de ambiente
    const systemWallets = getSystemWallets();

    // Mock de transferência Nano
    const txidBolsa = `mock_tx_bolsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const txidLucro = `mock_tx_lucro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Registrar transação de depósito
      const [result] = await connection.execute(
        'INSERT INTO transacao (usuario_id, tipo, valor_pontos, valor_nano, txid_nano, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'deposito', pontos, valor_nano, `${txidBolsa},${txidLucro}`, 'confirmado']
      );

      // Adicionar pontos ao usuário
      await connection.execute(
        'UPDATE usuario SET saldo_pontos = saldo_pontos + ? WHERE id = ?',
        [pontos, userId]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Depósito processado com sucesso',
        transacao: {
          id: result.insertId,
          tipo: 'deposito',
          valor_pontos: pontos,
          valor_nano: valor_nano,
          status: 'confirmado',
          distribuição: {
            carteira_bolsa: {
              endereco: systemWallets['carteira-bolsa'],
              valor: valorBolsa,
              txid: txidBolsa
            },
            carteira_lucro: {
              endereco: systemWallets['carteira-lucro'],
              valor: valorLucro,
              txid: txidLucro
            }
          }
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao processar depósito:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Solicitar saque
router.post('/saque', authMiddleware, async (req, res) => {
  try {
    const { valor_pontos, carteira_nano_destino } = req.body;
    const userId = req.user.id;

    if (!valor_pontos || valor_pontos <= 0) {
      return res.status(400).json({ message: 'Valor em pontos deve ser maior que zero' });
    }

    if (valor_pontos < 100) {
      return res.status(400).json({ message: 'Saque mínimo é de 100 pontos' });
    }

    if (!carteira_nano_destino) {
      return res.status(400).json({ message: 'Carteira Nano de destino é obrigatória' });
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
    if (saldoAtual < valor_pontos) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    // Converter pontos para Nano (1 ponto = 1 Nano)
    const valorNano = valor_pontos;

    // Mock de transferência Nano
    const txidSaque = `mock_tx_saque_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Registrar transação de saque
      const [result] = await connection.execute(
        'INSERT INTO transacao (usuario_id, tipo, valor_pontos, valor_nano, txid_nano, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'saque', valor_pontos, valorNano, txidSaque, 'confirmado']
      );

      // Deduzir pontos do usuário
      await connection.execute(
        'UPDATE usuario SET saldo_pontos = saldo_pontos - ? WHERE id = ?',
        [valor_pontos, userId]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Saque processado com sucesso',
        transacao: {
          id: result.insertId,
          tipo: 'saque',
          valor_pontos: valor_pontos,
          valor_nano: valorNano,
          status: 'confirmado',
          carteira_destino: carteira_nano_destino,
          txid: txidSaque
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar transações do usuário
router.get('/minhas', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo, status } = req.query;

    let query = 'SELECT * FROM transacao WHERE usuario_id = ?';
    let params = [userId];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY criado_em DESC';

    const [transacoes] = await pool.execute(query, params);

    res.json({ transacoes });

  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter carteiras do sistema
router.get('/carteiras', async (req, res) => {
  try {
    const systemWallets = getSystemWallets();
    
    res.json({
      carteiras: systemWallets,
      info: {
        carteira_bolsa: 'Recebe 85% dos depósitos',
        carteira_lucro: 'Recebe 15% dos depósitos'
      }
    });

  } catch (error) {
    console.error('Erro ao obter carteiras:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 