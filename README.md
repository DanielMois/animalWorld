# 🎰 AnimalWorld - Plataforma de Apostas com Nano

**Plataforma completa de apostas esportivas integrada com criptomoeda Nano, desenvolvida com AI-assisted coding.**

## 🚀 Funcionalidades

### 🔐 Autenticação e Segurança
- ✅ **Autenticação obrigatória via carteira Nano** - Usuários só acessam com carteira verificada
- ✅ **Verificação de pagamento via QR Code** - Compra de pontos exclusivamente via Nano
- ✅ **JWT authentication** para sessões seguras
- ✅ **Validação de endereços Nano** em tempo real
- ✅ **Simulação de pagamentos** para desenvolvimento

### 💰 Integração Nano Completa
- ✅ **Carteiras Nano configuráveis** via variáveis de ambiente
- ✅ **Geração de carteiras** para novos usuários
- ✅ **Verificação de saldo** em tempo real
- ✅ **Depósitos e saques** em Nano
- ✅ **QR Code de pagamento** para compra de pontos
- ✅ **Histórico de transações** completo

### 🎯 Sistema de Apostas
- ✅ **3 modalidades**: Dezena (01-99), Centena (001-999), Milhar (0001-9999)
- ✅ **Apostas permitidas** entre 9h e 17h
- ✅ **Limites por número**: Dezena (10pts), Centena (30pts), Milhar (50pts)
- ✅ **Validação de saldo** e limites em tempo real
- ✅ **Suporte a valores decimais** (0.05, 0.000001, etc.)
- ✅ **Histórico completo** de apostas

### 🎲 Sorteios e Resultados
- ✅ **Sorteio automático** às 18h (via admin)
- ✅ **Multiplicadores**: Dezena (20x), Centena (400x), Milhar (4000x)
- ✅ **Resultados e vencedores** em tempo real
- ✅ **Status dos sorteios** do dia

### 👨‍💼 Administração
- ✅ **Dashboard administrativo** com KPIs
- ✅ **Controle de sorteios** manual
- ✅ **Gestão de usuários** e transações
- ✅ **Relatórios** de performance

### 🖥️ Frontend React
- ✅ **Interface moderna** com Material-UI
- ✅ **Páginas responsivas**: Login, Registro, Dashboard, Apostas, Carteira, Resultados
- ✅ **Integração completa** com backend via Axios
- ✅ **Context API** para gerenciamento de estado
- ✅ **Navegação** com React Router

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express** - API REST
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Nano SDK** - Integração cripto
- **bcrypt** - Hash de senhas

### Frontend
- **React** - Interface do usuário
- **Material-UI** - Componentes visuais
- **Axios** - Comunicação com API
- **React Router** - Navegação
- **Context API** - Gerenciamento de estado

### DevOps
- **Scripts organizados** em pastas específicas
- **Configuração via .env** completa
- **Documentação** detalhada
- **Testes automatizados**

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- MySQL (v8.0 ou superior)
- npm ou yarn
- Carteiras Nano configuradas

## �� Instalação Rápida

### 1. **Clone e Configure**
```bash
git clone <url-do-repositorio>
cd animalworld
npm install
```

### 2. **Configuração Automática**
```bash
# Criar arquivo .env com todas as configurações
node scripts/setup/create-env.js

# Inicializar banco de dados
node scripts/setup/init-db.js

# Criar usuário de teste
node scripts/setup/create-nano-user.js
```

### 3. **Iniciar Servidores**
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🔧 Configuração Detalhada

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=animalworld

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:3000

# Carteiras Nano do Sistema
NANO_SYSTEM_WALLET=nano_3system123456789abcdefghijklmnopqrstuvwxyz
NANO_BOLSA_WALLET=nano_3bolsa123456789abcdefghijklmnopqrstuvwxyz
NANO_LUCRO_WALLET=nano_3lucro123456789abcdefghijklmnopqrstuvwxyz
NANO_ADMIN_WALLET=nano_3admin123456789abcdefghijklmnopqrstuvwxyz

# Configurações Nano
NANO_NODE_URL=https://nano-node.example.com
NANO_REPRESENTATIVE=nano_3representative123456789abcdefghijklmnopqrstuvwxyz
NANO_SIMULATION_MODE=true
```

### Credenciais de Teste

- **Admin**: `admin` / `admin123`
- **Usuário Teste**: `teste` / `123456` (carteira Nano configurada)

## 📚 API Endpoints

### 🔐 Autenticação Nano
- `POST /api/auth/registro` - Registro com carteira Nano
- `POST /api/auth/login` - Login com carteira Nano
- `POST /api/auth/verificar-pagamento` - Verificar pagamento inicial
- `GET /api/auth/perfil` - Perfil do usuário

### 💰 Carteira Nano
- `POST /api/nano/gerar-carteira` - Gerar nova carteira
- `GET /api/nano/saldo/:endereco` - Consultar saldo
- `POST /api/nano/deposito` - Solicitar depósito
- `POST /api/nano/saque` - Solicitar saque
- `GET /api/nano/transacoes/:endereco` - Histórico de transações
- `POST /api/nano/verificar-endereco` - Validar endereço

### 🎯 Apostas
- `POST /api/apostas` - Fazer aposta
- `GET /api/apostas/minhas` - Listar apostas do usuário
- `GET /api/apostas/pontos-disponiveis/:modalidade/:numero` - Pontos disponíveis

### 🎲 Sorteios
- `POST /api/sorteios/realizar` - Realizar sorteio (admin)
- `GET /api/sorteios/resultados` - Listar resultados
- `GET /api/sorteios/status-hoje` - Status dos sorteios do dia

### 👨‍💼 Administração
- `POST /api/admin/login` - Login de admin
- `GET /api/admin/dashboard` - Dashboard com KPIs
- `GET /api/admin/usuarios` - Listar usuários
- `GET /api/admin/transacoes` - Listar transações

## 🗂️ Estrutura do Projeto

```
animalworld/
├── 📁 backend/
│   ├── 📁 config/          # Configurações do banco
│   ├── 📁 middleware/      # Middlewares de autenticação
│   ├── 📁 routes/          # Rotas da API
│   ├── 📁 services/        # Serviços (Nano, etc.)
│   └── server.js           # Servidor principal
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # Componentes React
│   │   ├── 📁 pages/       # Páginas da aplicação
│   │   ├── 📁 context/     # Context API
│   │   └── 📁 services/    # Serviços do frontend
│   └── package.json
├── 📁 scripts/
│   ├── 📁 database/        # Scripts SQL e atualizações
│   ├── 📁 setup/           # Scripts de configuração
│   └── 📁 test/            # Scripts de teste
├── .env                    # Configurações (não versionado)
├── .gitignore             # Arquivos ignorados
└── README.md              # Este arquivo
```

## 🎯 Exemplos de Uso

### Registro com Carteira Nano
```bash
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "login": "usuario123",
    "carteira_nano": "nano_3usuario123..."
  }'
```

### Compra de Pontos via Nano
```bash
curl -X POST http://localhost:3001/api/nano/deposito \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "valor": 0.05,
    "endereco_destino": "nano_3system..."
  }'
```

### Fazer Aposta
```bash
curl -X POST http://localhost:3001/api/apostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "modalidade": "dezena",
    "numero_apostado": "27",
    "pontos_apostados": 0.05
  }'
```

## 🧪 Testes

```bash
# Testar conexão com banco
node scripts/test/test-db.js

# Testar valores decimais
node scripts/test/test-decimal.js

# Testar verificação de pagamento
node scripts/test/test-payment-verification.js
```

## 🔐 Segurança

### ✅ Implementado
- **Autenticação obrigatória** via carteira Nano
- **Verificação de pagamento** em tempo real
- **Validação de endereços** Nano
- **JWT tokens** seguros
- **Hash de senhas** com bcrypt
- **Variáveis de ambiente** para configurações sensíveis

### 🛡️ Proteções
- **Arquivos .env** não versionados
- **Carteiras Nano** protegidas
- **Logs sensíveis** ignorados
- **Backups** não versionados

## 🚨 Limitações e Observações

1. **Modo Simulação**: Nano em modo simulação para desenvolvimento
2. **Horários**: Apostas entre 9h-17h, sorteios às 18h
3. **Limites**: Respeitados os limites por número/modalidade
4. **Carteira Obrigatória**: Usuários precisam ter carteira Nano verificada

## 🔄 Próximos Passos

1. **Integração real** com rede Nano
2. **Notificações** em tempo real (WebSocket)
3. **Logs e auditoria** avançados
4. **Testes automatizados** completos
5. **Deploy** em produção

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação em `/scripts/`
- Verifique os logs de erro

---

## 🎉 Destaques do Projeto

- **🔐 Segurança**: Autenticação obrigatória via carteira Nano
- **💰 Cripto**: Integração completa com Nano cryptocurrency
- **🤖 AI-Assisted**: Desenvolvido com assistência de IA
- **📱 Moderno**: Frontend React com Material-UI
- **⚡ Rápido**: Setup automatizado com scripts
- **📚 Documentado**: Documentação completa e organizada

**Desenvolvido com ❤️ e assistência de IA para demonstrar integração moderna entre apostas e criptomoedas.** 