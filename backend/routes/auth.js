const router = require('express').Router();
const pool = require('../config/db'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// --- ROTA DE LOGIN ---
router.post('/login', async (req, res) => {
    const { login, senha, tipoSelecionado } = req.body;

    try {
        const emailBusca = login ? login.trim().toLowerCase() : "";
        
        const tabelas = {
            cpf: 'usuarios_cpf',
            cnpj: 'usuarios_cnpj',
            profissional: 'profissionais'
        };

        const tabela = tabelas[tipoSelecionado];
        
        if (!tabela) {
            return res.status(400).json({ message: "Tipo de usuário inválido." });
        }

        // Log para debug (aparecerá no Visualizador de Eventos se rodar como serviço)
        console.log(`[DEBUG] Tentativa de login: ${emailBusca} na tabela ${tabela}`);

        const [rows] = await pool.query(`SELECT * FROM ${tabela} WHERE email = ?`, [emailBusca]);

        if (rows.length === 0) {
            console.log("[DEBUG] Usuário não encontrado no banco.");
            return res.status(401).json({ message: "Usuário não cadastrado." });
        }

        const usuario = rows[0];

        // Comparação com bcrypt
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        console.log(`[DEBUG] Comparação de senha: ${senhaValida ? "SUCESSO" : "FALHA"}`);

        if (!senhaValida) {
            return res.status(401).json({ message: "Senha incorreta." });
        }

        const token = jwt.sign(
            { id: usuario.id, tipo: tabela },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            auth: true,
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome || usuario.nome_fantasia,
                tipo: tabela,
                foto: usuario.foto_perfil
            }
        });

    } catch (error) {
        console.error("Erro interno no login:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// --- ROTA DE CADASTRO DE PACIENTE ---
router.post('/cadastro-paciente', async (req, res) => {
    const { nome, email, senha, cpf, telefone } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const query = `INSERT INTO usuarios_cpf (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(query, [nome, email.toLowerCase(), senhaHash, cpf, telefone]);
        res.status(201).json({ message: "Paciente cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro no cadastro de paciente:", error);
        res.status(500).json({ error: "Erro ao realizar cadastro." });
    }
});

// --- ROTA DE CADASTRO DE PROFISSIONAL ---
router.post('/cadastro-profissional', async (req, res) => {
    const { nome, email, senha, crm, especialidade } = req.body; 
    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const query = `INSERT INTO profissionais (nome, email, senha, conselho, especialidade) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(query, [nome, email.toLowerCase(), senhaHash, crm, especialidade]);
        res.status(201).json({ message: "Profissional cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro no cadastro de profissional:", error);
        res.status(500).json({ error: "Erro ao realizar cadastro." });
    }
});

// --- ROTA DE CADASTRO DE CLÍNICA ---
router.post('/cadastro-clinica', async (req, res) => {
    const { nome_fantasia, email, senha, cnpj, telefone } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const query = `INSERT INTO usuarios_cnpj (nome_fantasia, email, senha, cnpj, telefone) VALUES (?, ?, ?, ?, ?)`;
        await pool.query(query, [nome_fantasia, email.toLowerCase(), senhaHash, cnpj, telefone]);
        res.status(201).json({ message: "Clínica cadastrada com sucesso!" });
    } catch (error) {
        console.error("Erro no cadastro de clínica:", error);
        res.status(500).json({ error: "Erro ao realizar cadastro." });
    }
});

// MIDDLEWARE PARA PROTEGER ROTAS
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userTipo = decoded.tipo;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
    }
};

module.exports = { router, verifyToken };