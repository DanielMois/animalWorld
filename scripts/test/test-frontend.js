// Simulando o que o frontend está enviando
function testFrontendValues() {
  console.log('=== Teste de Valores do Frontend ===');
  
  const testValues = ['0.05', '0.000001', '1.5', '0', '-1', 'abc'];
  
  testValues.forEach(value => {
    console.log(`\nValor original: "${value}" (${typeof value})`);
    
    // Simulando o que o frontend estava fazendo antes (parseInt)
    const oldWay = parseInt(value);
    console.log(`parseInt("${value}") = ${oldWay} (${typeof oldWay})`);
    
    // Simulando o que o frontend faz agora (parseFloat)
    const newWay = parseFloat(value);
    console.log(`parseFloat("${value}") = ${newWay} (${typeof newWay})`);
    
    // Testando a validação do backend
    const isValid = value && parseFloat(value) > 0;
    console.log(`Validação: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
  });
}

testFrontendValues(); 