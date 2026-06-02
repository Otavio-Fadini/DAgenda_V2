const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
const path = require('path');
const fs = require('fs');

// IMPORTAÇÃO DO BANCO DE DADOS PARA O WEBHOOK
const pool = require('./config/db');

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

// ==========================================
// ROTA GLOBAL: WEBHOOK DO MERCADO PAGO (À PROVA DE BALAS)
// ==========================================

// Função principal do webhook para não repetirmos código
const processarWebhookMP = async (req, res) => {
    // 1. Responde 200 OK imediatamente para o MP parar de tentar
    res.status(200).send('OK');
    console.log(`[WEBHOOK] Recebido na rota: ${req.originalUrl}`);

    try {
        const { type, data } = req.body;
        if (type === 'payment' && data && data.id) {
            const paymentId = data.id;
            const accessToken = process.env.MP_ACCESS_TOKEN;

            if (!accessToken) return console.error("[WEBHOOK] Erro: Token do MP não encontrado.");

            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            
            const paymentData = await mpResponse.json();

            if (paymentData && paymentData.status === 'approved') {
                const agendamentoId = paymentData.external_reference; 
                if (agendamentoId) {
                    await pool.query(
                        `UPDATE agendamentos SET status = 'Agendado' WHERE id = ? AND status = 'Pendente pagamento'`,
                        [agendamentoId]
                    );
                    console.log(`[WEBHOOK] Sucesso! Agendamento ${agendamentoId} pago com Pix.`);
                }
            }
        }
    } catch (error) {
        console.error("[WEBHOOK] Erro:", error);
    }
};

// Criamos a rota POST de duas formas para driblar qualquer bloqueio do seu servidor Windows
app.post('/api/webhook/mercadopago', processarWebhookMP);
app.post('/webhook/mercadopago', processarWebhookMP);

// ROTA DE TESTE: Para você testar no seu navegador
app.get('/api/webhook/mercadopago', (req, res) => {
    res.status(200).json({ status: "🟢 WEBHOOK ACESSÍVEL", mensagem: "O Mercado Pago consegue chegar aqui!" });
});
app.get('/webhook/mercadopago', (req, res) => {
    res.status(200).json({ status: "🟢 WEBHOOK ACESSÍVEL", mensagem: "Sem o /api também funciona!" });
});

// Teste de conexão
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "DAGENDA 2.0 ON", 
    banco: process.env.DB_NAME || "Não definido"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Dagenda Rodando em: http://localhost:${PORT}`);
});