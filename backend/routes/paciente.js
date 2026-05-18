const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// Rota para o paciente buscar o próprio prontuário
router.get('/meu-prontuario', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.evolucao as notas,
                p.prescricao,
                DATE_FORMAT(p.data_atendimento, '%d/%m/%Y') as data,
                prof.nome as medico,
                c.nome_fantasia as clinica
            FROM prontuarios p
            INNER JOIN profissionais prof ON p.id_profissional = prof.id
            INNER JOIN agendamentos a ON p.id_agendamento = a.id
            LEFT JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE p.id_paciente = ?
            ORDER BY p.data_atendimento DESC
        `;

        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        console.error("Erro no prontuário:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

module.exports = router;