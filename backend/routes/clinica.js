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

router.get('/financeiro-geral', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.nome as medico,
                COUNT(a.id) as total_consultas,
                SUM(prof.valor_consulta) as faturamento_total,
                SUM(prof.valor_consulta) * 0.7 as repasse_medico,
                SUM(prof.valor_consulta) * 0.3 as lucro_clinica
            FROM agendamentos a
            JOIN profissionais prof ON a.id_profissional = prof.id
            JOIN usuarios_cpf p ON prof.id = p.id -- Assumindo que o nome está aqui
            WHERE a.id_clinica = ? AND a.status = 'Finalizado'
            GROUP BY prof.id
        `;
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar financeiro" });
    }
});

module.exports = router;