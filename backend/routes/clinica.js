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
// ROTA: BUSCAR DADOS DO PERFIL (ATUALIZADA)
// ==========================================
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.userId;

        // Adicionado a busca da coluna 'endereco' e 'foto_perfil'
        const query = `
            SELECT nome_fantasia, cnpj, endereco, telefone, email, foto_perfil 
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
            cnpj: data.cnpj,
            endereco: data.endereco || '', // Mapeamento do novo campo de endereço
            telefone: data.telefone,
            email: data.email,
            logo: data.foto_perfil // Mapeamento da foto para o preview do React
        });
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: ATUALIZAR DADOS DO PERFIL (ATUALIZADA)
// ==========================================
router.put('/perfil', verifyToken, async (req, res) => {
    try {
        const usuarioId = req.userId;
        
        // Desestruturação incluindo 'endereco' e 'logo' vindos do formData do React
        const { nome_fantasia, cnpj, endereco, telefone, email, logo } = req.body;

        // Query atualizada incluindo as colunas 'endereco' e 'foto_perfil'
        const query = `
            UPDATE usuarios_cnpj 
            SET nome_fantasia = ?, 
                cnpj = ?, 
                endereco = ?, 
                telefone = ?, 
                email = ?, 
                foto_perfil = ?
            WHERE id = ?
        `;
        
        // Passagem ordenada de todos os parâmetros exigidos pelas interrogações acima
        await pool.query(query, [nome_fantasia, cnpj, endereco, telefone, email, logo, usuarioId]);

        res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ message: "Erro ao atualizar no banco." });
    }
});

module.exports = router;