# 🔒 Guia de Segurança - AnimalWorld

## ⚠️ ARQUIVOS QUE NUNCA DEVEM SER VERSIONADOS

### 🚨 CRÍTICO - Nunca commite estes arquivos:

#### 1. **Arquivos .env**
```
.env                    # Configurações de ambiente
.env.local             # Configurações locais
.env.production        # Configurações de produção
.env.development       # Configurações de desenvolvimento
```

**Por que é perigoso:**
- Contém senhas do banco de dados
- Chaves JWT secretas
- Endereços de carteiras Nano
- URLs de APIs privadas

#### 2. **Carteiras e Chaves Nano**
```
*.wallet               # Arquivos de carteira
*.seed                 # Seeds privados
*.private              # Chaves privadas
nano_wallet/           # Pasta de carteiras
wallet_backup/         # Backups de carteiras
```

**Por que é perigoso:**
- Acesso total aos fundos
- Perda irreversível de dinheiro
- Comprometimento da segurança

#### 3. **Banco de Dados**
```
*.db                   # Arquivos de banco
*.sqlite               # SQLite databases
*.dump                 # Dumps de banco
backups/               # Backups
animalworld_backup.sql # Backup específico
```

**Por que é perigoso:**
- Dados pessoais dos usuários
- Informações financeiras
- Histórico de transações

#### 4. **Logs e Debug**
```
*.log                  # Arquivos de log
logs/                  # Pasta de logs
animalworld.log        # Log específico
nano_transactions.log  # Log de transações
```

**Por que é perigoso:**
- Informações sensíveis em logs
- Endereços IP dos usuários
- Dados de transações

## ✅ O QUE PODE SER VERSIONADO

### 📁 Arquivos Seguros:
- `package.json` - Dependências
- `README.md` - Documentação
- `server.js` - Código principal
- `routes/` - Rotas da API
- `frontend/` - Código do frontend
- `scripts/database/` - Scripts SQL
- `scripts/test/` - Scripts de teste

### 📋 Templates Seguros:
- `scripts/setup/env_template.txt` - Template do .env
- `scripts/setup/create-env.js` - Script para criar .env

## 🛡️ BOAS PRÁTICAS DE SEGURANÇA

### 1. **Sempre use .env**
```bash
# ✅ Correto
DB_PASSWORD=minha_senha_secreta

# ❌ Errado (nunca no código)
const password = "minha_senha_secreta";
```

### 2. **Valide o .gitignore**
```bash
# Verificar se arquivos sensíveis estão sendo ignorados
git status
```

### 3. **Use variáveis de ambiente**
```javascript
// ✅ Correto
const dbPassword = process.env.DB_PASSWORD;

// ❌ Errado
const dbPassword = "123456";
```

### 4. **Backup seguro**
```bash
# ✅ Backup local (não versionado)
mysqldump -u root -p animalworld > backup_local.sql

# ❌ Nunca commite backups
git add backup_local.sql  # NUNCA!
```

## 🔍 COMO VERIFICAR SE ESTÁ SEGURO

### 1. **Verificar arquivos ignorados:**
```bash
git status --ignored
```

### 2. **Verificar se .env existe:**
```bash
ls -la .env
```

### 3. **Verificar configurações:**
```bash
# Ver se variáveis estão definidas
echo $DB_PASSWORD
```

## 🚨 EM CASO DE VAZAMENTO

### 1. **Imediatamente:**
- Mude todas as senhas
- Revogue chaves JWT
- Transfira fundos das carteiras
- Notifique usuários

### 2. **Investigue:**
- Verifique logs de acesso
- Identifique o que foi exposto
- Documente o incidente

### 3. **Corrija:**
- Atualize .gitignore
- Remova arquivos sensíveis do histórico
- Implemente medidas de segurança

## 📞 CONTATO EM CASO DE EMERGÊNCIA

Se você suspeitar de um vazamento de segurança:
1. **NÃO** commite mais nada
2. **Imediatamente** mude senhas e chaves
3. **Documente** o que foi exposto
4. **Notifique** usuários se necessário

---

## 🎯 RESUMO

**NUNCA commite:**
- ❌ Arquivos .env
- ❌ Carteiras Nano
- ❌ Backups de banco
- ❌ Logs com dados sensíveis
- ❌ Chaves privadas

**SEMPRE commite:**
- ✅ Código fonte
- ✅ Documentação
- ✅ Templates
- ✅ Scripts de setup
- ✅ Configurações de desenvolvimento 