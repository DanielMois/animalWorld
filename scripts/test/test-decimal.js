const axios = require('axios');

async function testDecimalValues() {
  try {
    console.log('Testando valores decimais...\n');

    // Teste 1: 0.05 pontos
    console.log('Teste 1: 0.05 pontos');
    try {
      const response1 = await axios.post('http://localhost:3001/api/transacoes/comprar-pontos', {
        valor_pontos: 0.05
      }, {
        headers: {
          'Authorization': 'Bearer SEU_TOKEN_AQUI' // Você precisará de um token válido
        }
      });
      console.log('✅ 0.05 pontos aceito:', response1.data);
    } catch (error) {
      console.log('❌ 0.05 pontos rejeitado:', error.response?.data?.message || error.message);
    }

    // Teste 2: 0.000001 pontos
    console.log('\nTeste 2: 0.000001 pontos');
    try {
      const response2 = await axios.post('http://localhost:3001/api/transacoes/comprar-pontos', {
        valor_pontos: 0.000001
      }, {
        headers: {
          'Authorization': 'Bearer SEU_TOKEN_AQUI'
        }
      });
      console.log('✅ 0.000001 pontos aceito:', response2.data);
    } catch (error) {
      console.log('❌ 0.000001 pontos rejeitado:', error.response?.data?.message || error.message);
    }

    // Teste 3: 1.5 pontos
    console.log('\nTeste 3: 1.5 pontos');
    try {
      const response3 = await axios.post('http://localhost:3001/api/transacoes/comprar-pontos', {
        valor_pontos: 1.5
      }, {
        headers: {
          'Authorization': 'Bearer SEU_TOKEN_AQUI'
        }
      });
      console.log('✅ 1.5 pontos aceito:', response3.data);
    } catch (error) {
      console.log('❌ 1.5 pontos rejeitado:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

// Teste direto da validação do backend
function testBackendValidation() {
  console.log('\n=== Teste de Validação do Backend ===');
  
  const testValues = [0.05, 0.000001, 1.5, 0, -1, 'abc'];
  
  testValues.forEach(value => {
    const isValid = value && parseFloat(value) > 0;
    console.log(`${value} (${typeof value}): ${isValid ? '✅ Válido' : '❌ Inválido'}`);
  });
}

testBackendValidation();
// testDecimalValues(); // Descomente se quiser testar com o servidor rodando 