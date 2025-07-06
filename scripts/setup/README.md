# Scripts de Configuração

Scripts para configurar e inicializar o ambiente AnimalWorld.

## 📄 Arquivos

### `create-env.js`
Cria o arquivo `.env` com todas as configurações:
- Configurações do banco de dados
- Endereços das carteiras Nano
- Chaves JWT
- Configurações do servidor
- URLs de API

### `env_template.txt`
Template com todas as variáveis de ambiente:
- Estrutura completa do `.env`
- Comentários explicativos
- Valores padrão
- Configurações de exemplo

### `init-db.js`
Inicializa o banco de dados:
- Cria o banco se não existir
- Executa o schema inicial
- Insere dados básicos
- Configura usuário admin

### `create-test-user.js`
Cria usuário de teste básico:
- Login: "teste"
- Senha: "123456"
- Saldo inicial: 100 pontos
- Carteira Nano configurada

### `create-nano-user.js`
Cria usuário com carteira Nano:
- Usuário com autenticação Nano
- Carteira verificada
- Saldo inicial configurado
- Pronto para testes

## 🚀 Como usar

### Configuração inicial completa
```bash
# 1. Criar arquivo .env
node create-env.js

# 2. Inicializar banco de dados
node init-db.js

# 3. Criar usuário de teste
node create-nano-user.js
```

### Apenas configuração
```bash
# Criar apenas o .env
node create-env.js
```

### Apenas usuários
```bash
# Usuário básico
node create-test-user.js

# Usuário com Nano
node create-nano-user.js
```

## 📋 Ordem obrigatória

1. **Primeiro**: `create-env.js` - Configurar ambiente
2. **Segundo**: `init-db.js` - Inicializar banco
3. **Terceiro**: `create-nano-user.js` - Criar usuário

## 🔧 Configurações importantes

### Banco de dados
- **Host**: localhost
- **Port**: 3306
- **Database**: animalworld
- **User**: root
- **Password**: 123456

### Carteiras Nano
- **Sistema**: Recebe pagamentos
- **Usuário**: Para testes
- **Admin**: Para administração

### Servidor
- **Backend**: Porta 3001
- **Frontend**: Porta 3000
- **JWT Secret**: Chave secreta

## ⚠️ Importante

- **Sempre execute** `create-env.js` primeiro
- **Verifique** as configurações no `.env`
- **Teste** a conexão antes de continuar
- **Faça backup** se já tiver dados
- **Execute** em ambiente de desenvolvimento 