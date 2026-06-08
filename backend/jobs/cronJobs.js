const cron = require('node-cron');
const pool = require('../config/db'); // Ajuste o caminho conforme necessário

const iniciarJobs = () => {
    // Roda a cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
        console.log('--- Verificando agendamentos para cancelamento automático ---');

        try {
            // REGRA 1: Cancelar se não pago (15 min antes da consulta)
            await pool.query(`
                UPDATE agendamentos 
                SET status = 'Cancelado', motivo_cancelamento = 'Cancelado por falta de pagamento (15 min antes)'
                WHERE status = 'Pendente pagamento' 
                AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(data_agendamento, ' ', horario)) <= 15
                AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(data_agendamento, ' ', horario)) > 0
            `);

            // REGRA 2: Cancelar se profissional não iniciar (30 min após o horário)
            await pool.query(`
                UPDATE agendamentos 
                SET status = 'Cancelado', motivo_cancelamento = 'Cancelado por não comparecimento do profissional'
                WHERE status = 'Agendado' 
                AND TIMESTAMPDIFF(MINUTE, CONCAT(data_agendamento, ' ', horario), NOW()) >= 30
            `);
        } catch (error) {
            console.error("Erro ao rodar cron job de cancelamento:", error);
        }
    });
};

module.exports = iniciarJobs;