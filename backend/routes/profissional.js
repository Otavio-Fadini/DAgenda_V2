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
                a.id_paciente,
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

        if (data) {
            query += ` AND a.data_agendamento = ? `;
            queryParams.push(data);
        } else {
            query += ` AND a.data_agendamento >= CURDATE() `;
        }

        if (status && status !== 'Todos') {
            query += ` AND a.status = ? `;
            queryParams.push(status.toLowerCase());
        }

        if (busca) {
            query += ` AND p.nome LIKE ? `;
            queryParams.push(`%${busca}%`);
        }

        query += ` ORDER BY a.data_agendamento ASC, a.horario ASC `;

        const [rows] = await pool.query(query, queryParams);
        
        res.json(rows.map(row => ({
            id: row.id,
            id_paciente: row.id_paciente, // <--- ADICIONADO: Agora o frontend vai receber o ID
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

// Rota para finalizar o atendimento e gerar o prontuário
router.post('/finalizar-atendimento', verifyToken, async (req, res) => {
    const { id_agendamento, id_paciente, evolucao, prescricao } = req.body;
    
    try {
        // VERIFICAÇÃO DE DUPLICIDADE
        const [check] = await pool.query(
            'SELECT id FROM prontuarios WHERE id_agendamento = ?', 
            [id_agendamento]
        );

        if (check.length > 0) {
            return res.status(400).json({ message: "Este atendimento já foi finalizado anteriormente." });
        }

        // Se não existir, insere normal
        await pool.query(
            'INSERT INTO prontuarios (id_agendamento, id_paciente, id_profissional, evolucao, prescricao) VALUES (?, ?, ?, ?, ?)',
            [id_agendamento, id_paciente, req.userId, evolucao, prescricao]
        );

        await pool.query(
            'UPDATE agendamentos SET status = ? WHERE id = ?', 
            ['Finalizado', id_agendamento]
        );

        res.json({ message: "Atendimento finalizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro interno ao salvar." });
    }
});


// Buscar histórico de prontuários de um paciente específico
router.get('/historico-paciente/:id_paciente', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.evolucao, 
                p.prescricao, 
                DATE_FORMAT(p.data_atendimento, '%d/%m/%Y %H:%i') as data_formatada
            FROM prontuarios p
            WHERE p.id_paciente = ?
            ORDER BY p.data_atendimento DESC
        `;
        const [rows] = await pool.query(query, [req.params.id_paciente]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
});

router.get('/meu-prontuario', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.evolucao as notas,
                p.prescricao,
                DATE_FORMAT(p.data_atendimento, '%d/%m/%Y') as data,
                prof.nome as medico,
                'Especialidade' as especialidade, 
                c.nome_fantasia as clinica
            FROM prontuarios p
            JOIN profissionais prof ON p.id_profissional = prof.id
            LEFT JOIN agendamentos a ON p.id_agendamento = a.id
            LEFT JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE p.id_paciente = ?
            ORDER BY p.data_atendimento DESC
        `;
        // O req.userId vem do verifyToken
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar prontuário" });
    }
});

module.exports = router;