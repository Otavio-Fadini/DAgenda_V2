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
// ROTA GLOBAL: WEBHOOK DO MERCADO PAGO
// ==========================================
app.post('/api/webhook/mercadopago', async (req, res) => {
    // 1. Responde 200 OK imediatamente
    res.status(200).send('OK');

    try {
        const { type, data } = req.body;

        // 2. Só nos interessa se for um aviso de "pagamento" e se tiver um ID
        if (type === 'payment' && data && data.id) {
            const paymentId = data.id;
            const accessToken = process.env.MP_ACCESS_TOKEN;

            if (!accessToken) {
                console.error("[WEBHOOK] Erro: Token do MP não encontrado no .env");
                return;
            }

            // 3. Vamos ao Mercado Pago perguntar: "O que é este pagamento com ID X?"
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            
            const paymentData = await mpResponse.json();

            // 4. Se o status for "approved" (Pago com sucesso)
            if (paymentData && paymentData.status === 'approved') {
                
                // O 'external_reference' guarda o ID do nosso agendamento
                const agendamentoId = paymentData.external_reference; 

                if (agendamentoId) {
                    // 5. A MÁGICA ACONTECE AQUI: Atualiza o banco de dados
                    await pool.query(
                        `UPDATE agendamentos SET status = 'Agendado' WHERE id = ? AND status = 'Pendente pagamento'`,
                        [agendamentoId]
                    );
                    console.log(`[WEBHOOK] Sucesso! Agendamento ${agendamentoId} pago e confirmado.`);
                }
            }
        }
    } catch (error) {
        console.error("[WEBHOOK] Erro ao processar aviso do Mercado Pago:", error);
    }
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