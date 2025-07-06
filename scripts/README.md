# Scripts do AnimalWorld

Esta pasta contém todos os scripts utilitários, de teste e configuração do projeto AnimalWorld.

## 📁 Estrutura das Pastas

### `/database`
Scripts relacionados ao banco de dados:
- **Schema SQL**: Definição das tabelas
- **Atualizações**: Scripts para modificar estrutura
- **Correções**: Scripts para resolver problemas

### `/test`
Scripts de teste e validação:
- **Testes de funcionalidade**: Verificar se tudo funciona
- **Testes de validação**: Validar dados e configurações
- **Testes de pagamento**: Verificar integração Nano

### `/setup`
Scripts de configuração inicial:
- **Criação de usuários**: Usuários de teste
- **Configuração de ambiente**: Arquivo .env
- **Inicialização**: Setup inicial do projeto

## 🚀 Como usar

### Configuração Inicial
```bash
# Criar arquivo .env
node scripts/setup/create-env.js

# Inicializar banco de dados
node scripts/setup/init-db.js

# Criar usuário de teste
node scripts/setup/create-nano-user.js
```

### Atualizações do Banco
```bash
# Atualizar schema
node scripts/database/update-database.js

# Corrigir problemas
node scripts/database/fix-database.js
```

### Testes
```bash
# Testar conexão com banco
node scripts/test/test-db.js

# Testar valores decimais
node scripts/test/test-decimal.js

# Testar verificação de pagamento
node scripts/test/test-payment-verification.js
```

## 📋 Ordem de Execução Recomendada

1. **Setup inicial**: `setup/create-env.js`
2. **Banco de dados**: `setup/init-db.js`
3. **Atualizações**: `database/update-database.js`
4. **Usuários de teste**: `setup/create-nano-user.js`
5. **Testes**: `test/test-db.js`

## ⚠️ Importante

- Execute os scripts na ordem correta
- Verifique as configurações no `.env` antes de executar
- Faça backup do banco antes de executar scripts de atualização
- Teste em ambiente de desenvolvimento primeiro 