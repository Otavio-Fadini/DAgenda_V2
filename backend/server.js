const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
require('dotenv').config();

const app = express();

// Importação corrigida (authData contém .router e .verifyToken)
const authData = require('./routes/auth');
const agendamentosRoutes = require('./routes/agendamentos');
const profissionalRoutes = require('./routes/profissional');


// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rotas
app.use('/api/auth', authData.router); // Roteador de login
app.use('/api/agendamentos', agendamentosRoutes); // Roteador de agendamentos
app.use('/api/profissional', profissionalRoutes);

// Teste de conexão
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "DAGENDA 2.0 ON", 
    banco: process.env.DB_NAME 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Dagenda Rodando em: http://localhost:${PORT}`);
});