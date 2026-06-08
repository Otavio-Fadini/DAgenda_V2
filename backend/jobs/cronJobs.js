const cron = require('node-cron');
const pool = require('../config/db');

const iniciarJobs = () => {
    // Roda a cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
        console.log('--- Verificando agendamentos para cancelamento automático ---');

        try {
            // 1. Gera a data e hora exata do Brasil, ignorando o fuso da AWS
            const dataAtualSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            
            const ano = dataAtualSP.getFullYear();
            const mes = String(dataAtualSP.getMonth() + 1).padStart(2, '0');
            const dia = String(dataAtualSP.getDate()).padStart(2, '0');
            const horas = String(dataAtualSP.getHours()).padStart(2, '0');
            const minutos = String(dataAtualSP.getMinutes()).padStart(2, '0');
            const segundos = String(dataAtualSP.getSeconds()).padStart(2, '0');
            
            // Cria a string no formato seguro para o MySQL (YYYY-MM-DD HH:MM:SS)
            const agoraBr = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

            // REGRA 1: Cancelar se não pago (15 min antes da consulta)
            await pool.query(`
                UPDATE agendamentos 
                SET status = 'Cancelado', motivo_cancelamento = 'Cancelado por falta de pagamento (regra 15 min)'
                WHERE status = 'Pendente pagamento' 
                AND TIMESTAMPDIFF(MINUTE, ?, CONCAT(data_agendamento, ' ', horario)) <= 15
                AND TIMESTAMPDIFF(MINUTE, ?, CONCAT(data_agendamento, ' ', horario)) > 0
            `, [agoraBr, agoraBr]);

            // REGRA 2: Cancelar se profissional não iniciar (30 min após o horário)
            await pool.query(`
                UPDATE agendamentos 
                SET status = 'Cancelado', motivo_cancelamento = 'Cancelado por não comparecimento do profissional'
                WHERE status = 'Agendado' 
                AND TIMESTAMPDIFF(MINUTE, CONCAT(data_agendamento, ' ', horario), ?) >= 30
            `, [agoraBr]);

        } catch (error) {
            console.error("Erro ao rodar cron job de cancelamento:", error);
        }
    });
};

module.exports = iniciarJobs;