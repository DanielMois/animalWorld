const NanoService = require('./services/nanoService');

async function testPaymentVerification() {
  console.log('=== Teste de Verificação de Pagamento ===\n');

  const testAddress = 'nano_1cmu9meas5nudnxxy8oozcr9ahs89xc4s6x35x77zp8a8pxtemhyfwbfzajy';
  const testAmount = 0.05;

  console.log(`Testando verificação de pagamento:`);
  console.log(`Endereço: ${testAddress}`);
  console.log(`Valor esperado: ${testAmount} Nano\n`);

  try {
    console.log('Chamando checkPaymentReceived...');
    const result = await NanoService.checkPaymentReceived(testAddress, testAmount);
    
    console.log('Resultado completo:', JSON.stringify(result, null, 2));
    console.log('\nResultado da verificação:');
    console.log(`- Recebido: ${result.received ? '✅ Sim' : '❌ Não'}`);
    
    if (result.received) {
      console.log(`- Valor: ${result.amount} Nano`);
      console.log(`- Timestamp: ${new Date(result.timestamp).toLocaleString()}`);
      console.log(`- Hash: ${result.hash}`);
    }
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPaymentVerification(); 