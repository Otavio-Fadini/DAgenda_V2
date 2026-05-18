const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// BUSCAR PERFIL
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT valor_consulta, duracao_sessao, atende_convenio FROM profissionais WHERE id = ?', 
            [req.userId]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// ATUALIZAR PERFIL
router.put('/perfil', verifyToken, async (req, res) => {
    const { valor_consulta, duracao_sessao, atende_convenio } = req.body;
    try {
        await pool.query(
            'UPDATE profissionais SET valor_consulta = ?, duracao_sessao = ?, atende_convenio = ? WHERE id = ?',
            [valor_consulta, duracao_sessao, atende_convenio ? 1 : 0, req.userId]
        );
        res.json({ message: "Sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar" });
    }
});

router.get('/agenda', verifyToken, async (req, res) => {
    try {
        const { data, status, busca } = req.query;
        let query = `
            SELECT 
                a.id, 
                DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') as data_formatada, 
                TIME_FORMAT(a.horario, '%H:%i') as horario, 
                a.status, 
                a.tipo_agendamento,
                p.nome as paciente_nome,
                c.nome_fantasia as clinica_nome
            FROM agendamentos a
            LEFT JOIN usuarios_cpf p ON a.id_paciente = p.id
            LEFT JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE a.id_profissional = ?
        `;

        const queryParams = [req.userId];

        // Filtro por Data
        if (data) {
            query += ` AND a.data_agendamento = ? `;
            queryParams.push(data);
        } else {
            query += ` AND a.data_agendamento >= CURDATE() `;
        }

        // Filtro por Status (Confirmado, Pendente, etc)
        if (status && status !== 'Todos') {
            query += ` AND a.status = ? `;
            queryParams.push(status.toLowerCase());
        }

        // Filtro por Nome do Paciente (Busca Parcial)
        if (busca) {
            query += ` AND p.nome LIKE ? `;
            queryParams.push(`%${busca}%`);
        }

        query += ` ORDER BY a.data_agendamento ASC, a.horario ASC `;

        const [rows] = await pool.query(query, queryParams);
        
        res.json(rows.map(row => ({
            id: row.id,
            hora: row.horario,
            data: row.data_formatada,
            paciente: row.paciente_nome || "Paciente não identificado",
            clinica: row.clinica_nome || "Unidade Principal",
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            tipo: row.tipo_agendamento || 'Consulta'
        })));
    } catch (error) {
        res.status(500).json({ error: "Erro ao filtrar agenda" });
    }
});

module.exports = router;