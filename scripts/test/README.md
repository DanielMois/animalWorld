# Scripts de Teste

Scripts para testar e validar funcionalidades do AnimalWorld.

## 📄 Arquivos

### `test-db.js`
Testa a conexão com o banco de dados:
- Verifica se o banco está acessível
- Testa as credenciais de conexão
- Valida se as tabelas existem
- Mostra informações do banco

### `test-decimal.js`
Testa o suporte a valores decimais:
- Valida valores como 0.05, 0.000001, 1.5
- Testa a conversão parseInt vs parseFloat
- Verifica se o backend aceita decimais
- Simula requisições HTTP

### `test-frontend.js`
Testa a lógica do frontend:
- Simula valores enviados pelo usuário
- Testa conversão de tipos
- Valida formatação de dados
- Verifica compatibilidade

### `test-payment-verification.js`
Testa a verificação de pagamentos Nano:
- Testa a função `checkPaymentReceived`
- Valida endereços de pagamento
- Verifica simulação vs produção
- Testa diferentes valores

## 🚀 Como usar

### Teste de conexão
```bash
# Verificar se o banco está funcionando
node test-db.js
```

### Teste de valores decimais
```bash
# Testar suporte a decimais
node test-decimal.js

# Testar lógica do frontend
node test-frontend.js
```

### Teste de pagamentos
```bash
# Testar verificação de pagamento
node test-payment-verification.js
```

## 📋 Ordem de execução

1. **Primeiro**: `test-db.js` - Verificar banco
2. **Depois**: `test-decimal.js` - Testar decimais
3. **Em seguida**: `test-frontend.js` - Validar frontend
4. **Por último**: `test-payment-verification.js` - Testar pagamentos

## 🔍 O que verificar

### Banco de dados
- ✅ Conexão estabelecida
- ✅ Credenciais corretas
- ✅ Tabelas existem
- ✅ Permissões adequadas

### Valores decimais
- ✅ 0.05 é aceito
- ✅ 0.000001 é aceito
- ✅ 1.5 é aceito
- ✅ 0 é rejeitado
- ✅ Valores negativos são rejeitados

### Pagamentos
- ✅ Simulação funciona
- ✅ Endereços são válidos
- ✅ Valores são processados
- ✅ Resposta é correta

## ⚠️ Importante

- Execute os testes **após** configurar o banco
- Verifique se o **servidor está rodando**
- Confirme as **configurações do .env**
- Teste **um por vez** para identificar problemas 