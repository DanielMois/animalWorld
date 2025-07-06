require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('API AnimalWorld rodando!');
});

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apostaRoutes = require('./routes/apostas');
const sorteioRoutes = require('./routes/sorteios');
const transacaoRoutes = require('./routes/transacoes');
const nanoRoutes = require('./routes/nano');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/apostas', apostaRoutes);
app.use('/api/sorteios', sorteioRoutes);
app.use('/api/transacoes', transacaoRoutes);
app.use('/api/nano', nanoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 