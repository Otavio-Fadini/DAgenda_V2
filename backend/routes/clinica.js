const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// ==========================================
// ROTA: DASHBOARD DA CLÍNICA
// ==========================================
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

// ==========================================
// ROTA: LISTAR MÉDICOS VINCULADOS À CLÍNICA
// ==========================================
router.get('/medicos-unidade', verifyToken, async (req, res) => {
    const clinicaId = req.userId;

    try {
        // AQUI: Adicionamos o p.foto_perfil para a imagem ir para o React
        const query = `
            SELECT p.id, p.nome, p.especialidade, p.conselho, p.foto_perfil 
            FROM profissionais p
            INNER JOIN vinculo_profissional_clinica v ON p.id = v.id_profissional
            WHERE v.id_clinica = ?
        `;
        
        const [medicos] = await pool.query(query, [clinicaId]);
        res.json(medicos);

    } catch (error) {
        console.error("Erro ao carregar médicos da unidade:", error);
        res.status(500).json({ error: "Erro interno.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: FINANCEIRO GERAL (CORRIGIDA)
// ==========================================
router.get('/financeiro-geral', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.nome as medico,
                COUNT(a.id) as total_consultas,
                SUM(a.valor) as faturamento_total,
                -- Se repasse é 30 (ex), a clínica fica com 100 - 30 = 70%
                -- Logo: (100 - c.repasse) / 100
                SUM(a.valor) * ((100 - c.repasse) / 100) as lucro_clinica
            FROM agendamentos a
            JOIN profissionais prof ON a.id_profissional = prof.id
            JOIN usuarios_cpf p ON prof.id = p.id 
            JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE a.id_clinica = ? AND a.status IN ('agendado', 'concluido')
            GROUP BY prof.id, p.nome, c.repasse
        `;
        
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao calcular repasse:", error);
        res.status(500).json({ error: "Erro ao carregar financeiro" });
    }
});

// ==========================================
// ROTA: BUSCAR DADOS DO PERFIL 
// ==========================================
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.userId;

        const query = `
            SELECT nome_fantasia, cnpj, telefone, email, foto_perfil, razao_social, 
                   comodidades, cep, rua, numero, complemento, bairro, cidade, estado, repasse 
            FROM usuarios_cnpj 
            WHERE id = ?
        `;
        const [rows] = await pool.query(query, [usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const data = rows[0];
        res.json({
            nome_fantasia: data.nome_fantasia,
            razao_social: data.razao_social,
            cnpj: data.cnpj,
            telefone: data.telefone,
            email: data.email,
            logo: data.foto_perfil,
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
            comodidades: data.comodidades || '',
            repasse: data.repasse || ''
        });
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: ATUALIZAR DADOS DO PERFIL
// ==========================================
router.put('/perfil', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.userId;
        
        // Pega os dados do body (se algo não vier, fica undefined)
        const { 
            nome_fantasia, cnpj, telefone, email, logo, razao_social, 
            cep, rua, numero, complemento, bairro, cidade, estado, 
            comodidades, repasse 
        } = req.body;

        // PREVENÇÃO DE ERRO 1: Converte o array de comodidades para String (JSON)
        // Se vier vazio ou não vier, salva como string vazia '[]'
        const comodidadesString = comodidades ? JSON.stringify(comodidades) : '[]';

        const query = `
            UPDATE usuarios_cnpj 
            SET nome_fantasia = ?, 
                cnpj = ?, 
                telefone = ?, 
                email = ?, 
                foto_perfil = ?,
                razao_social = ?,
                cep = ?,
                rua = ?,
                numero = ?,
                complemento = ?, 
                bairro = ?,
                cidade = ?,
                estado = ?,
                comodidades = ?,
                repasse = ?
            WHERE id = ?
        `;
        
        // PREVENÇÃO DE ERRO 2: Usamos "|| null" para garantir que nenhum undefined 
        // quebre o banco de dados. Se o React não mandar o campo, ele grava como NULL.
        await pool.query(query, [
            nome_fantasia || null, 
            cnpj || null, 
            telefone || null, 
            email || null, 
            logo || null, 
            razao_social || null,
            cep || null, 
            rua || null, 
            numero || null, 
            complemento || null, 
            bairro || null, 
            cidade || null, 
            estado || null, 
            comodidadesString, // Usamos a string convertida aqui!
            repasse || null, 
            usuarioId
        ]);

        res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (error) {
        // Se der erro, ele vai imprimir o motivo EXATO no terminal do Node.js
        console.error("Erro EXATO ao atualizar perfil:", error);
        res.status(500).json({ message: "Erro ao atualizar no banco." });
    }
});

// ==========================================
// ROTA: BUSCAR PROFISSIONAIS PROXIMOS PARA CONVITE
// ==========================================
router.get('/buscar-profissionais', verifyToken, async (req, res) => {
    const clinicaId = req.userId; // Vem do token JWT

    try {
        // 1. Descobrir a cidade da clínica logada
        const [clinica] = await pool.query(`SELECT cidade FROM usuarios_cnpj WHERE id = ?`, [clinicaId]);
        
        if (clinica.length === 0 || !clinica[0].cidade) {
            return res.status(400).json({ message: "Cidade da clínica não encontrada." });
        }
        
        const cidadeClinica = clinica[0].cidade;

        // 2. Buscar médicos da mesma cidade que aceitam convites e não têm vínculo/convite pendente
        const queryBusca = `
            SELECT id, nome, especialidade, foto_perfil, cidade 
            FROM profissionais 
            WHERE cidade = ? 
            AND aceita_convites = 1
            AND id NOT IN (SELECT id_profissional FROM vinculo_profissional_clinica WHERE id_clinica = ?)
            AND id NOT IN (SELECT profissional_id FROM convites_clinica WHERE clinica_id = ? AND status = 'pendente')
        `;

        const [profissionais] = await pool.query(queryBusca, [cidadeClinica, clinicaId, clinicaId]);
        
        res.json(profissionais);

    } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        res.status(500).json({ error: "Erro interno.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: ENVIAR CONVITE
// ==========================================
router.post('/enviar-convite', verifyToken, async (req, res) => {
    const clinicaId = req.userId;
    const { profissional_id } = req.body;

    try {
        const query = `INSERT INTO convites_clinica (clinica_id, profissional_id, status) VALUES (?, ?, 'pendente')`;
        await pool.query(query, [clinicaId, profissional_id]);
        
        res.status(201).json({ message: "Convite enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar convite:", error);
        // O código ER_DUP_ENTRY previne que a clínica mande o mesmo convite 2 vezes seguidas
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Um convite já foi enviado para este profissional." });
        }
        res.status(500).json({ error: "Erro ao enviar convite.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: VER AGENDA COMPLETA DA CLÍNICA
// ==========================================
router.get('/agenda-completa', verifyToken, async (req, res) => {
    const clinicaId = req.userId; // Ou req.clinicaId, dependendo de como está o seu token
    const dataFiltro = req.query.data;

    try {
        const query = `
            SELECT a.id, a.horario, a.status, a.tipo_agendamento,
                   paciente.nome AS nome_paciente,
                   medico.nome AS nome_medico
            FROM agendamentos a
            JOIN usuarios_cpf paciente ON a.id_paciente = paciente.id
            JOIN profissionais medico ON a.id_profissional = medico.id
            WHERE a.id_clinica = ? 
            AND a.data_agendamento = ?
            ORDER BY a.horario ASC
        `;
        
        const [consultas] = await pool.query(query, [clinicaId, dataFiltro]);
        res.json(consultas);

    } catch (error) {
        console.error("Erro ao buscar agenda completa da clínica:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: VER AGENDA ESPECÍFICA DO MÉDICO
// ==========================================
router.get('/medicos/:id/agenda', verifyToken, async (req, res) => {
    const clinicaId = req.userId; // ou req.clinicaId, dependendo do seu verifyToken
    const medicoId = req.params.id;
    const dataFiltro = req.query.data;

    try {
        // Verifica as consultas do médico X, na clínica Y, no dia Z
        const query = `
            SELECT a.id, a.horario, a.status, a.tipo_agendamento, a.data_agendamento,
                   paciente.nome AS nome_paciente
            FROM agendamentos a
            JOIN usuarios_cpf paciente ON a.id_paciente = paciente.id
            WHERE a.id_profissional = ? 
            AND a.id_clinica = ? 
            AND a.data_agendamento = ?
            ORDER BY a.horario ASC
        `;
        
        const [consultas] = await pool.query(query, [medicoId, clinicaId, dataFiltro]);
        res.json(consultas);

    } catch (error) {
        console.error("Erro ao buscar agenda do médico:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});



module.exports = router;