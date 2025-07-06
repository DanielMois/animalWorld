const nano = require('nano');
const crypto = require('crypto');
require('dotenv').config();

// Configuração do Nano (usando node principal público)
const NANO_NODE_URL = process.env.NANO_NODE_URL || 'https://api.nanocrawler.cc';
const nanoClient = nano(NANO_NODE_URL);

class NanoService {
  constructor() {
    this.pendingTransactions = new Map();
    
    // Carregar endereços das variáveis de ambiente
    this.verificationAddress = process.env.NANO_VERIFICATION_ADDRESS || 'nano_1animalworld1verification1address1for1wallet1check1';
    this.verificationAmount = process.env.NANO_VERIFICATION_AMOUNT || '0.001';
    this.paymentAddress = process.env.NANO_PAYMENT_ADDRESS || 'nano_1cmu9meas5nudnxxy8oozcr9ahs89xc4s6x35x77zp8a8pxtemhyfwbfzajy';
    this.bolsaAddress = process.env.NANO_BOLSA_ADDRESS || 'nano_3bolsa123456789abcdefghijklmnopqrstuvwxyz';
    this.lucroAddress = process.env.NANO_LUCRO_ADDRESS || 'nano_3lucro123456789abcdefghijklmnopqrstuvwxyz';
    
    // Configurações de desenvolvimento
    this.simulationMode = process.env.NANO_SIMULATION_MODE === 'true';
    this.paymentTimeout = parseInt(process.env.NANO_PAYMENT_TIMEOUT) || 30;
    
    console.log('NanoService inicializado com as seguintes configurações:');
    console.log(`- Node URL: ${NANO_NODE_URL}`);
    console.log(`- Endereço de Pagamento: ${this.paymentAddress}`);
    console.log(`- Endereço de Verificação: ${this.verificationAddress}`);
    console.log(`- Modo Simulação: ${this.simulationMode}`);
  }

  // Obter endereço de verificação
  async getVerificationAddress() {
    return this.verificationAddress;
  }

  // Obter endereço de pagamento principal
  async getPaymentAddress() {
    return this.paymentAddress;
  }

  // Obter endereços das carteiras do sistema
  getSystemAddresses() {
    return {
      payment: this.paymentAddress,
      verification: this.verificationAddress,
      bolsa: this.bolsaAddress,
      lucro: this.lucroAddress
    };
  }

  // Verificar propriedade da carteira através de pagamento de verificação
  async verifyWalletOwnership(walletAddress) {
    try {
      // Verificar se houve pagamento de verificação para esta carteira
      const verificationPayments = await this.getVerificationPayments(walletAddress);
      
      if (verificationPayments.length > 0) {
        // Verificar se o pagamento foi confirmado
        const latestPayment = verificationPayments[0];
        const isConfirmed = await this.isTransactionConfirmed(latestPayment.hash);
        
        return {
          verified: isConfirmed,
          paymentHash: latestPayment.hash,
          amount: latestPayment.amount,
          timestamp: latestPayment.timestamp
        };
      }
      
      return { verified: false };
    } catch (error) {
      console.error('Erro ao verificar propriedade da carteira:', error);
      return { verified: false };
    }
  }

  // Obter pagamentos de verificação para uma carteira
  async getVerificationPayments(walletAddress) {
    try {
      // Simular verificação de pagamentos de verificação
      // Em produção, isso seria implementado com monitoramento real
      const payments = [];
      
      // Verificar se há transações pendentes ou confirmadas
      const accountInfo = await nanoClient.accounts.info([walletAddress]);
      const pending = await nanoClient.accounts.pending([walletAddress]);
      
      if (accountInfo[walletAddress]) {
        const account = accountInfo[walletAddress];
        
        // Verificar histórico de transações
        const history = await nanoClient.accounts.history(walletAddress, 10);
        
        for (const transaction of history.history) {
          if (transaction.type === 'receive' && 
              transaction.account === this.verificationAddress &&
              Math.abs(parseFloat(transaction.amount) - parseFloat(this.verificationAmount)) < 0.000001) {
            payments.push({
              hash: transaction.hash,
              amount: transaction.amount,
              timestamp: transaction.timestamp,
              confirmed: transaction.confirmed
            });
          }
        }
      }
      
      return payments.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Erro ao obter pagamentos de verificação:', error);
      return [];
    }
  }

  // Gerar nova carteira Nano
  async generateWallet() {
    try {
      const account = nanoClient.wallet.create();
      const address = account.address;
      const privateKey = account.privateKey;
      
      return {
        address,
        privateKey,
        publicKey: account.publicKey
      };
    } catch (error) {
      console.error('Erro ao gerar carteira Nano:', error);
      throw new Error('Falha ao gerar carteira Nano');
    }
  }

  // Verificar saldo de uma carteira
  async getBalance(address) {
    try {
      const accountInfo = await nanoClient.accounts.balance([address]);
      
      // Verificar se o endereço existe e tem saldo
      if (accountInfo && accountInfo[address] && accountInfo[address].balance) {
        const balance = accountInfo[address].balance;
        return nanoClient.convert.fromRaw(balance, 'NANO');
      }
      
      // Se o endereço não existe ou não tem saldo, retornar 0
      return 0;
    } catch (error) {
      console.error('Erro ao verificar saldo:', error);
      return 0;
    }
  }

  // Verificar se houve pagamento para um endereço específico
  async checkPaymentReceived(paymentAddress, expectedAmount) {
    try {
      // Se estiver em modo simulação, sempre retorna true
      if (this.simulationMode) {
        console.log(`[SIMULAÇÃO] Pagamento de ${expectedAmount} Nano confirmado para ${paymentAddress}`);
        return {
          received: true,
          amount: expectedAmount,
          timestamp: Date.now(),
          hash: `simulated_tx_${Date.now()}`,
          simulation: true
        };
      }
      
      // Em produção, implementar verificação real da blockchain
      // Por enquanto, retorna false para forçar verificação real
      console.log(`[PRODUÇÃO] Verificando pagamento real de ${expectedAmount} Nano para ${paymentAddress}`);
      
      // Aqui você implementaria a verificação real
      // Por exemplo, verificar o histórico de transações do endereço
      const balance = await this.getBalance(paymentAddress);
      
      if (balance >= expectedAmount) {
        return {
          received: true,
          amount: expectedAmount,
          timestamp: Date.now(),
          hash: `real_tx_${Date.now()}`,
          simulation: false
        };
      }
      
      return { received: false };
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return { received: false };
    }
  }

  // Criar transação de pagamento
  async createPayment(fromAddress, toAddress, amount, privateKey) {
    try {
      // Converter NANO para raw (menor unidade)
      const amountRaw = nanoClient.convert.toRaw(amount, 'NANO');
      
      // Obter informações da conta
      const accountInfo = await nanoClient.accounts.info([fromAddress]);
      const account = accountInfo[fromAddress];
      
      // Criar bloco de transação
      const block = {
        type: 'state',
        account: fromAddress,
        previous: account.frontier,
        representative: account.representative,
        balance: nanoClient.convert.toRaw(
          nanoClient.convert.fromRaw(account.balance, 'NANO') - amount, 
          'NANO'
        ),
        link: toAddress,
        signature: ''
      };

      // Assinar o bloco
      const signature = nanoClient.wallet.sign(block, privateKey);
      block.signature = signature;

      // Processar a transação
      const result = await nanoClient.blocks.process(block);
      
      return {
        hash: result.hash,
        amount: amount,
        from: fromAddress,
        to: toAddress,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new Error('Falha ao processar pagamento Nano');
    }
  }

  // Verificar se uma transação foi confirmada
  async isTransactionConfirmed(hash) {
    try {
      const blockInfo = await nanoClient.blocks.info([hash]);
      return blockInfo[hash].confirmed === 'true';
    } catch (error) {
      console.error('Erro ao verificar confirmação:', error);
      return false;
    }
  }

  // Monitorar transações para uma carteira
  async monitorTransactions(address, callback) {
    try {
      const accountInfo = await nanoClient.accounts.info([address]);
      const account = accountInfo[address];
      
      // Verificar transações pendentes
      const pending = await nanoClient.accounts.pending([address]);
      
      if (pending[address]) {
        for (const hash of Object.keys(pending[address])) {
          // Processar transação pendente
          const block = {
            type: 'state',
            account: address,
            previous: account.frontier,
            representative: account.representative,
            balance: nanoClient.convert.toRaw(
              nanoClient.convert.fromRaw(account.balance, 'NANO') + 
              nanoClient.convert.fromRaw(pending[address][hash], 'NANO'), 
              'NANO'
            ),
            link: hash,
            signature: ''
          };

          // Assinar e processar
          const signature = nanoClient.wallet.sign(block, privateKey);
          block.signature = signature;
          
          const result = await nanoClient.blocks.process(block);
          
          if (callback) {
            callback({
              type: 'received',
              hash: result.hash,
              amount: nanoClient.convert.fromRaw(pending[address][hash], 'NANO'),
              from: hash,
              to: address,
              timestamp: Date.now()
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao monitorar transações:', error);
    }
  }

  // Gerar QR Code para pagamento
  generatePaymentQR(toAddress, amount) {
    const paymentData = {
      address: toAddress,
      amount: amount
    };
    
    // Formato URI para Nano
    const nanoURI = `nano:${toAddress}?amount=${amount}`;
    
    return {
      uri: nanoURI,
      qrData: nanoURI,
      address: toAddress,
      amount: amount
    };
  }

  // Validar endereço Nano
  validateAddress(address) {
    try {
      return nanoClient.validateAddress(address);
    } catch (error) {
      return false;
    }
  }

  // Converter entre unidades
  convertToRaw(amount, unit = 'NANO') {
    return nanoClient.convert.toRaw(amount, unit);
  }

  convertFromRaw(amount, unit = 'NANO') {
    return nanoClient.convert.fromRaw(amount, unit);
  }
}

module.exports = new NanoService(); 