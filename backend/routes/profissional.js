const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');
const bcrypt = require('bcrypt');

// ==========================================
// ROTA: BUSCAR PERFIL COMPLETO
// ==========================================
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const id = req.userId;

        const [rows] = await pool.query(
            `SELECT 
                nome, email, conselho, especialidade, valor_consulta, cpf, data_nascimento,
                duracao_sessao, atende_convenio, foto_perfil,
                cep, rua, numero, complemento, bairro, cidade, estado
             FROM profissionais WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Profissional não encontrado" });

        // Busca a disponibilidade cadastrada para este profissional
        const [horarios] = await pool.query(
            'SELECT dia_semana as dia, ativo, hora_inicio as inicio, hora_fim as fim FROM disponibilidade_profissional WHERE profissional_id = ?',
            [id]
        );

        const perfil = rows[0];
        perfil.horarios = horarios; // Envia os horários junto com os dados do perfil

        res.json(perfil); 
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ==========================================
// ROTA: ATUALIZAR PERFIL COMPLETO (ATUALIZADA)
// ==========================================
router.put('/perfil', verifyToken, async (req, res) => {
    try {
        const id = req.userId;
        const { 
            nome, email, conselho, especialidade, valor_consulta, duracao_sessao, 
            atende_convenio, senha, foto_perfil, horarios,
            cep, rua, numero, complemento, bairro, cidade, estado, cpf, data_nascimento
        } = req.body;

        // 2. Atualiza os dados básicos, foto, e agora o endereço completo
        let query = `
            UPDATE profissionais 
            SET nome=?, email=?, conselho=?, especialidade=?, valor_consulta=?, duracao_sessao=?, atende_convenio=?, foto_perfil=?,
                cep=?, rua=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?, cpf=?, data_nascimento=?
        `;
        
        let queryParams = [
            nome || null, 
            email || null, 
            conselho || null, 
            especialidade || null, 
            valor_consulta || null, 
            duracao_sessao || null, 
            atende_convenio ? 1 : 0, 
            foto_perfil || null,
            cep || null, 
            rua || null, 
            numero || null, 
            complemento || null, 
            bairro || null, 
            cidade || null, 
            estado || null,
            cpf || null,
            data_nascimento || null
        ];

        // 3. Se uma nova senha foi enviada, adiciona a criptografia dinamicamente
        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);
            query += `, senha=?`;
            queryParams.push(hashedPassword);
        }

        query += ` WHERE id=?`;
        queryParams.push(id);

        await pool.query(query, queryParams);

        // 4. Atualiza a tabela de disponibilidade_profissional (Limpa e reinsere)
        if (horarios && horarios.length > 0) {
            await pool.query('DELETE FROM disponibilidade_profissional WHERE profissional_id = ?', [id]);

            for (const h of horarios) {
                await pool.query(
                    'INSERT INTO disponibilidade_profissional (profissional_id, dia_semana, ativo, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?)',
                    [id, h.dia, h.ativo ? 1 : 0, h.inicio || '08:00', h.fim || '18:00']
                );
            }
        }

        res.json({ message: "Perfil e configurações atualizados com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro ao atualizar as configurações do perfil" });
    }
});

// ==========================================
// ROTA: AGENDA
// ==========================================
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
                a.motivo_cancelamento,
                p.nome as paciente_nome,
                c.nome_fantasia as clinica_nome,
                e.nome_arquivo as exame_nome,
                e.arquivo_base64 as exame_base64
            FROM agendamentos a
            LEFT JOIN usuarios_cpf p ON a.id_paciente = p.id
            LEFT JOIN usuarios_cnpj c ON a.id_clinica = c.id
            LEFT JOIN exames_agendamento e ON e.agendamento_id = a.id
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
            // Removido o toLowerCase() para casar perfeitamente com 'Pendente pagamento', 'Agendado', etc.
            query += ` AND a.status = ? `;
            queryParams.push(status);
        }

        if (busca) {
            query += ` AND p.nome LIKE ? `;
            queryParams.push(`%${busca}%`);
        }

        query += ` ORDER BY a.data_agendamento ASC, a.horario ASC `;

        const [rows] = await pool.query(query, queryParams);
        
        res.json(rows.map(row => ({
            id: row.id,
            id_paciente: row.id_paciente,
            hora: row.horario,             // Mantido para compatibilidade com outras telas antigas
            horario: row.horario,          // Adicionado para o novo AgendaMedica.jsx
            data: row.data_formatada,
            paciente: row.paciente_nome || "Paciente não identificado",
            paciente_nome: row.paciente_nome || "Paciente não identificado", // Adicionado para o novo AgendaMedica.jsx
            clinica: row.clinica_nome || "Unidade Principal",
            status: row.status,            // Mantém a formatação original do banco para os Chips de cores funcionarem
            tipo: row.tipo_agendamento || 'Consulta',
            motivo_cancelamento: row.motivo_cancelamento,
            exame_nome: row.exame_nome,
            exame_base64: row.exame_base64
        })));
    } catch (error) {
        console.error("Erro na rota /agenda:", error);
        res.status(500).json({ error: "Erro ao filtrar agenda" });
    }
});

// ==========================================
// ROTA: FINANCEIRO
// ==========================================
router.get('/financeiro', verifyToken, async (req, res) => {
    try {
        const profissionalId = req.userId;

        const [rows] = await pool.query(
            `SELECT id, data_agendamento as data, horario as hora, valor, 
                    (valor * 0.1) as taxa, (valor * 0.9) as liquido, 
                    status, 'C' as tipo, id_paciente 
             FROM agendamentos 
             WHERE id_profissional = ? 
             ORDER BY id DESC`,
            [profissionalId]
        );

        const saldoTotal = rows.reduce((acc, curr) => acc + Number(curr.liquido), 0);

        res.json({
            saldo_total: saldoTotal,
            lancamentos: rows.map(r => ({
                id: r.id,
                pac: 'Consulta #' + r.id, 
                data: r.data,
                hora: r.hora,
                valor: Number(r.valor || 0).toFixed(2),
                taxa: Number(r.taxa || 0).toFixed(2),
                liquido: Number(r.liquido || 0).toFixed(2),
                status: r.status || 'Pendente',
                tipo: r.tipo
            }))
        });
    } catch (error) {
        console.error("Erro no financeiro:", error);
        res.status(500).json({ error: "Erro ao buscar financeiro." });
    }
});

// ==========================================
// ROTA: FINALIZAR ATENDIMENTO
// ==========================================
router.post('/finalizar-atendimento', verifyToken, async (req, res) => {
    const { id_agendamento, id_paciente, evolucao, prescricao } = req.body;
    
    try {
        // 1. Trava de segurança: Verifica se já existe prontuário para este agendamento
        const [check] = await pool.query(
            'SELECT id FROM prontuarios WHERE id_agendamento = ?', 
            [id_agendamento]
        );

        if (check.length > 0) {
            return res.status(400).json({ message: "Este atendimento já foi finalizado anteriormente." });
        }

        // 2. Insere os dados clínicos
        await pool.query(
            'INSERT INTO prontuarios (id_agendamento, id_paciente, id_profissional, evolucao, prescricao) VALUES (?, ?, ?, ?, ?)',
            [id_agendamento, id_paciente, req.userId, evolucao, prescricao]
        );

        // 3. Atualiza o status do agendamento (Agora usando 'Concluido' para bater com o Frontend)
        await pool.query(
            'UPDATE agendamentos SET status = ? WHERE id = ?', 
            ['Concluido', id_agendamento]
        );

        res.json({ message: "Atendimento finalizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao finalizar atendimento:", error);
        res.status(500).json({ error: "Erro interno ao salvar." });
    }
});

// ==========================================
// ROTA: BUSCAR PRONTUÁRIO (RESUMO)
// ==========================================
router.get('/prontuario/:id_agendamento', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT evolucao, prescricao FROM prontuarios WHERE id_agendamento = ?',
            [req.params.id_agendamento]
        );
        
        if (rows.length > 0) {
            res.json(rows[0]); // Devolve os textos gravados
        } else {
            res.json({ evolucao: '', prescricao: '' });
        }
    } catch (error) {
        console.error("Erro ao buscar prontuário:", error);
        res.status(500).json({ error: "Erro ao carregar o resumo." });
    }
});

// ==========================================
// ROTA: HISTÓRICO DO PACIENTE
// ==========================================
router.get('/historico-paciente/:id', verifyToken, async (req, res) => {
    try {
        const pacienteId = req.params.id;

        // Fazemos um JOIN com a tabela de profissionais para buscar o nome e o CRM
        const [historico] = await pool.query(`
            SELECT 
                h.id,
                DATE_FORMAT(h.data_atendimento, '%d/%m/%Y') as data_formatada,
                h.evolucao,
                h.prescricao,
                p.nome as profissional_nome,
                p.conselho as profissional_crm
            FROM prontuarios h
            LEFT JOIN profissionais p ON h.id_profissional = p.id
            WHERE h.id_paciente = ?
            ORDER BY h.data_atendimento DESC
        `, [pacienteId]);

        res.json(historico);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ error: "Erro ao buscar histórico do paciente." });
    }
});

// ==========================================
// ROTA: MEU PRONTUÁRIO
// ==========================================
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
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar prontuário" });
    }
});

// ==========================================
// ROTA: DISPONIBILIDADE
// ==========================================
router.post('/disponibilidade', verifyToken, async (req, res) => {
    try {
        const profissionalId = req.userId;
        const { dias } = req.body;

        await pool.query('DELETE FROM disponibilidade_profissional WHERE profissional_id = ?', [profissionalId]);

        for (const dia of dias) {
            await pool.query(
                'INSERT INTO disponibilidade_profissional (profissional_id, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)',
                [profissionalId, dia.dia, dia.inicio, dia.fim]
            );
        }
        res.json({ message: "Disponibilidade salva!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar horários." });
    }
});

// ==========================================
// ROTA: DASHBOARD DO PROFISSIONAL
// ==========================================
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const id_profissional = req.userId;

        // KPI 1: Consultas Hoje (Ignora os cancelados)
        const [resConsultasHoje] = await pool.query(
            `SELECT COUNT(*) AS total FROM agendamentos 
             WHERE id_profissional = ? AND data_agendamento = CURDATE() AND status != 'Cancelado'`,
            [id_profissional]
        );

        // KPI 2: Total de pacientes únicos
        const [resTotalPacientes] = await pool.query(
            `SELECT COUNT(DISTINCT id_paciente) AS total FROM agendamentos 
             WHERE id_profissional = ?`,
            [id_profissional]
        );

        // KPI 3: Faturamento Dia (Soma a coluna 'valor' apenas das consultas de HOJE que estão pagas ou concluídas)
        const [resFaturamento] = await pool.query(
            `SELECT SUM(CAST(valor AS DECIMAL(10,2))) AS total 
             FROM agendamentos 
             WHERE id_profissional = ? 
               AND data_agendamento = CURDATE() 
               AND status IN ('Agendado', 'Concluido')`,
            [id_profissional]
        );

        // Próximas Consultas: Busca os próximos 5 pacientes agendados a partir de hoje
        const [resProximas] = await pool.query(
            `SELECT 
                a.id, 
                a.id_paciente,
                DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') as data_agendamento,
                TIME_FORMAT(a.horario, '%H:%i') as horario,
                a.status,
                a.tipo_agendamento as tipo,
                p.nome as paciente,
                p.foto_perfil
             FROM agendamentos a
             JOIN usuarios_cpf p ON a.id_paciente = p.id
             WHERE a.id_profissional = ? AND a.data_agendamento >= CURDATE()
             ORDER BY a.data_agendamento ASC, a.horario ASC
             LIMIT 5`,
            [id_profissional]
        );

        res.json({
            kpis: {
                consultasHoje: resConsultasHoje[0].total || 0,
                totalPacientes: resTotalPacientes[0].total || 0,
                faturamentoDia: resFaturamento[0].total || 0 // <-- Alterado o nome da variável
            },
            proximasConsultas: resProximas
        });

    } catch (error) {
        console.error("Erro na rota do Dashboard:", error);
        res.status(500).json({ error: "Erro ao carregar dados do dashboard" });
    }
});

// ==========================================
// ROTA: LISTAR CONVITES PENDENTES
// ==========================================
router.get('/meus-convites', verifyToken, async (req, res) => {
    const profissionalId = req.userId;

    try {
        const query = `
            SELECT c.id AS convite_id, c.data_envio, u.nome_fantasia, u.cidade, u.foto_perfil 
            FROM convites_clinica c
            INNER JOIN usuarios_cnpj u ON c.clinica_id = u.id
            WHERE c.profissional_id = ? AND c.status = 'pendente'
        `;
        const [convites] = await pool.query(query, [profissionalId]);
        res.json(convites);
    } catch (error) {
        console.error("Erro ao listar convites:", error);
        res.status(500).json({ 
            error: "Erro ao buscar notificações.",
            motivoReal: error.sqlMessage || error.message 
        });
    }
});

// ==========================================
// ROTA: RESPONDER CONVITE DE CLÍNICA
// ==========================================
router.put('/responder-convite', verifyToken, async (req, res) => {
    const profissionalId = req.userId;
    const { convite_id, resposta } = req.body; // 'resposta' deve ser 'aceito' ou 'recusado'

    if (!['aceito', 'recusado'].includes(resposta)) {
        return res.status(400).json({ error: "Resposta inválida." });
    }

    try {
        // Atualiza o status do convite
        await pool.query(`UPDATE convites_clinica SET status = ? WHERE id = ? AND profissional_id = ?`, [resposta, convite_id, profissionalId]);

        // Se ele aceitou, cria o vínculo oficial!
        if (resposta === 'aceito') {
            const [convite] = await pool.query(`SELECT clinica_id FROM convites_clinica WHERE id = ?`, [convite_id]);
            
            if (convite.length > 0) {
                await pool.query(
                    `INSERT IGNORE INTO vinculo_profissional_clinica (id_clinica, id_profissional) VALUES (?, ?)`, 
                    [convite[0].clinica_id, profissionalId]
                );
            }
        }

        res.json({ message: `Convite ${resposta} com sucesso!` });
    } catch (error) {
        console.error("Erro ao responder convite:", error);
        res.status(500).json({ error: "Erro ao processar resposta.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: CONFIGURAÇÕES DE PRIVACIDADE
// ==========================================
router.put('/config-privacidade', verifyToken, async (req, res) => {
    const profissionalId = req.userId;
    const { aceita_convites } = req.body; // 1 para SIM, 0 para NÃO

    try {
        await pool.query(`UPDATE profissionais SET aceita_convites = ? WHERE id = ?`, [aceita_convites, profissionalId]);
        res.json({ message: "Preferência de privacidade atualizada!" });
    } catch (error) {
        console.error("Erro ao atualizar privacidade:", error);
        res.status(500).json({ error: "Erro ao salvar configuração." });
    }
});

module.exports = router;