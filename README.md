# 🎰 AnimalWorld - Plataforma de Apostas

Backend da plataforma AnimalWorld desenvolvido em Node.js com Express e MySQL.

## 🚀 Funcionalidades

### Usuários
- ✅ Registro e login com JWT
- ✅ Saldo inicial de 10 pontos (cortesia)
- ✅ Depósito via Nano (mock)
- ✅ Saque em Nano (mínimo 100 pontos)
- ✅ Perfil do usuário

### Apostas
- ✅ 3 modalidades: Dezena (01-99), Centena (001-999), Milhar (0001-9999)
- ✅ Apostas permitidas entre 9h e 17h
- ✅ Limites por número: Dezena (10pts), Centena (30pts), Milhar (50pts)
- ✅ Validação de saldo e limites
- ✅ Histórico de apostas

### Sorteios
- ✅ Sorteio automático às 18h (via admin)
- ✅ Multiplicadores: Dezena (20x), Centena (400x), Milhar (4000x)
- ✅ Resultados e vencedores
- ✅ Status dos sorteios do dia

### Transações
- ✅ Depósito com distribuição 85%/15% (carteira-bolsa/carteira-lucro)
- ✅ Saque com validação de saldo mínimo
- ✅ Mock de integração Nano
- ✅ Histórico de transações

### Administração
- ✅ Login de admin
- ✅ Dashboard com KPIs
- ✅ Controle de sorteios

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v8.0 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd animalworld
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Execute o script SQL para criar as tabelas
mysql -u root -p animalworld < animalworld_schema.sql
```

4. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=animalworld
JWT_SECRET=sua_chave_secreta_muito_segura
```

5. **Inicialize o banco de dados**
```bash
npm run init-db
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=animalworld

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Servidor
PORT=3001

# Carteiras Nano (mock)
CARTEIRA_BOLSA=nano_3bolsa123456789abcdefghijklmnopqrstuvwxyz
CARTEIRA_LUCRO=nano_3lucro123456789abcdefghijklmnopqrstuvwxyz
```

### Credenciais Padrão

- **Admin**: `admin` / `admin123`
- **Usuário**: Registre-se via API

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/registro` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/perfil` - Perfil do usuário (autenticado)

### Administração
- `POST /api/admin/login` - Login de admin
- `GET /api/admin/dashboard` - Dashboard com KPIs (admin)

### Apostas
- `POST /api/apostas` - Fazer aposta (autenticado)
- `GET /api/apostas/minhas` - Listar apostas do usuário (autenticado)
- `GET /api/apostas/pontos-disponiveis/:modalidade/:numero` - Pontos disponíveis (autenticado)

### Sorteios
- `POST /api/sorteios/realizar` - Realizar sorteio (admin)
- `GET /api/sorteios/resultados` - Listar resultados
- `GET /api/sorteios/resultado/:id` - Resultado específico
- `GET /api/sorteios/status-hoje` - Status dos sorteios do dia

### Transações
- `POST /api/transacoes/deposito` - Solicitar depósito (autenticado)
- `POST /api/transacoes/saque` - Solicitar saque (autenticado)
- `GET /api/transacoes/minhas` - Listar transações (autenticado)
- `GET /api/transacoes/carteiras` - Carteiras do sistema

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `usuario` - Usuários da plataforma
- `admin` - Administradores
- `aposta` - Apostas realizadas
- `sorteio` - Sorteios realizados
- `resultado_aposta` - Resultados das apostas
- `transacao` - Depósitos e saques
- `carteira_sistema` - Carteiras Nano do sistema

## 🎯 Exemplos de Uso

### Registro de Usuário
```bash
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "login": "usuario123",
    "senha": "senha123",
    "carteira_nano": "nano_3usuario123..."
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
    "pontos_apostados": 5
  }'
```

### Realizar Sorteio (Admin)
```bash
curl -X POST http://localhost:3001/api/sorteios/realizar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{
    "modalidade": "dezena",
    "data_sorteio": "2024-01-15"
  }'
```

## 🚨 Limitações e Observações

1. **Integração Nano**: Atualmente usando mock. Para produção, implemente integração real com a rede Nano.
2. **Horários**: Apostas permitidas entre 9h e 17h, sorteios às 18h.
3. **Limites**: Respeitados os limites de pontos por número/modalidade.
4. **Segurança**: Senhas hasheadas com bcrypt, JWT para autenticação.

## 🔄 Próximos Passos

1. Implementar integração real com Nano
2. Desenvolver frontend (React/Vue.js)
3. Implementar notificações em tempo real
4. Adicionar logs e auditoria
5. Implementar testes automatizados

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a plataforma AnimalWorld** 