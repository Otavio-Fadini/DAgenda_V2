const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');
const bcrypt = require('bcrypt'); // Adicionado para criptografar a nova senha do paciente

// ==========================================
// ROTA: BUSCAR PERFIL DO PACIENTE
// ==========================================
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const id = req.userId;
        const query = `
            SELECT nome, cpf, telefone, email, foto_perfil, 
                   cep, rua, numero, bairro, cidade, estado 
            FROM usuarios_cpf 
            WHERE id = ?
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) return res.status(404).json({ message: "Paciente não encontrado." });

        const data = rows[0];
        res.json({
            nome: data.nome || '',
            cpf: data.cpf || '',
            telefone: data.telefone || '',
            email: data.email || '',
            foto_perfil: data.foto_perfil || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || ''
        });
    } catch (error) {
        console.error("Erro ao buscar perfil do paciente:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// ==========================================
// ROTA: ATUALIZAR PERFIL DO PACIENTE
// ==========================================
router.put('/perfil', verifyToken, async (req, res) => {
    try {
        const id = req.userId;
        const { nome, telefone, email, foto_perfil, cep, rua, numero, bairro, cidade, estado, senha } = req.body;

        // Atualiza os dados normais (O CPF não é alterado por segurança)
        let query = `
            UPDATE usuarios_cpf 
            SET nome = ?, telefone = ?, email = ?, foto_perfil = ?, 
                cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, estado = ?
        `;
        let params = [nome, telefone, email, foto_perfil, cep, rua, numero, bairro, cidade, estado];

        // Se o paciente digitou uma nova senha, nós a criptografamos e adicionamos na query dinamicamente
        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);
            query += `, senha = ?`;
            params.push(hashedPassword);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await pool.query(query, params);

        res.status(200).json({ message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar paciente:", error);
        res.status(500).json({ message: "Erro ao atualizar dados." });
    }
});

// ==========================================
// ROTA: BUSCAR PRONTUÁRIO
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

// ==========================================
// ROTA: DADOS FINANCEIROS
// ==========================================
router.get('/financeiro', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                DATE_FORMAT(p.data_atendimento, '%d/%m/%Y') as data,
                CONCAT('Consulta ', prof.especialidade) as descricao,
                prof.valor_consulta as valor,
                'Pago' as status,
                'Pix/Cartão' as metodo
            FROM prontuarios p
            JOIN profissionais prof ON p.id_profissional = prof.id
            WHERE p.id_paciente = ?
            GROUP BY p.id_agendamento -- <--- ISSO VAI UNIFICAR AS DUPLICATAS
            ORDER BY p.data_atendimento DESC
        `;
        
        const [rows] = await pool.query(query, [req.userId]);
        const totalInvestido = rows.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

        res.json({
            historico: rows,
            totalInvestido: totalInvestido,
            totalConsultas: rows.length
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar dados financeiros" });
    }
});

module.exports = router;