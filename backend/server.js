const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log("DB_NAME carregado:", process.env.DB_NAME); // DEBUG: Veja se isso aparece no Event Viewer
console.log("JWT_SECRET carregado:", process.env.JWT_SECRET ? "OK" : "VAZIO"); // DEBUG

const app = express();

// Importação corrigida (authData contém .router e .verifyToken)
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
    banco: process.env.DB_NAME 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Dagenda Rodando em: http://localhost:${PORT}`);
});