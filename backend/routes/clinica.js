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
// ROTA: FINANCEIRO GERAL
// ==========================================
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
            JOIN usuarios_cpf p ON prof.id = p.id 
            WHERE a.id_clinica = ? AND a.status = 'Finalizado'
            GROUP BY prof.id
        `;
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
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
        
        const { nome_fantasia, cnpj, telefone, email, logo, razao_social, cep, rua, numero, complemento, bairro, cidade, estado, comodidades, repasse } = req.body;

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
        
        await pool.query(query, [
            nome_fantasia, 
            cnpj, 
            telefone, 
            email, 
            logo, 
            razao_social,
            cep, 
            rua, 
            numero, 
            complemento,
            bairro, 
            cidade, 
            estado, 
            comodidades,
            repasse,
            usuarioId
        ]);

        res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
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

module.exports = router;