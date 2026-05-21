const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
const path = require('path');
const fs = require('fs');


// Forçando o caminho absoluto para o serviço do Windows nunca se perder
const envPath = path.join('C:\\Projetos\\DAgenda\\backend', '.env');
require('dotenv').config({ path: envPath });

const app = express();

// Importações
const { router: authRoutes } = require('./routes/auth');
const clinicaRoutes = require('./routes/clinica');
const profissionalRoutes = require('./routes/profissional');
const pacienteRoutes = require('./routes/paciente');
const agendamentoRoutes = require('./routes/agendamentos');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/profissional', profissionalRoutes);
app.use('/api/paciente', pacienteRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/clinica', clinicaRoutes);

// Teste de conexão
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "DAGENDA 2.0 ON", 
    banco: process.env.DB_NAME || "Não definido"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const msg = `🚀 Dagenda Rodando em: http://localhost:${PORT}`;
  console.log(msg);
  logInit(msg);
});