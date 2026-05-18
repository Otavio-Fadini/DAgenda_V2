const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// DASHBOARD DA CLÍNICA (Total de médicos, consultas do mês)
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM vinculo_profissional_clinica WHERE id_clinica = ?) as total_medicos,
                (SELECT COUNT(*) FROM agendamentos WHERE id_clinica = ? AND MONTH(data_agendamento) = MONTH(CURDATE())) as consultas_mes
        `, [req.userId, req.userId]);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar dashboard da clínica" });
    }
});

// LISTAR MÉDICOS VINCULADOS À CLÍNICA
router.get('/medicos-unidade', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.nome, p.especialidade, p.conselho 
            FROM profissionais p
            JOIN vinculo_profissional_clinica v ON p.id = v.id_profissional
            WHERE v.id_clinica = ?
        `;
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar médicos" });
    }
});

module.exports = router;