const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// Configuração do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-8023357430156573-070213-ea790c5ea47494f7376c78501bda5942-307618485' 
});

// 1. LISTAR TODOS OS PROFISSIONAIS
router.get('/profissionais', async (req, res) => {
    try {
        const query = `SELECT id, nome, especialidade, foto_perfil, valor_consulta, atende_convenio FROM profissionais ORDER BY nome ASC`;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        res.status(500).json({ error: "Erro ao buscar profissionais" });
    }
});

// 2. LISTAR CLÍNICAS ONDE O MÉDICO ATENDE
router.get('/vinculos/clinicas/:profissionalId', async (req, res) => {
    try {
        const { profissionalId } = req.params;
        const query = `
            SELECT c.id, c.nome_fantasia, c.foto_perfil
            FROM usuarios_cnpj c
            JOIN vinculo_profissional_clinica v ON c.id = v.id_clinica
            WHERE v.id_profissional = ?
        `;
        const [rows] = await pool.query(query, [profissionalId]);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar vínculos:", error);
        res.status(500).json({ error: "Erro ao buscar clínicas vinculadas" });
    }
});

// 3. PAGAMENTO E CRIAÇÃO DO AGENDAMENTO (CORRIGIDO E FUNCIONAL)
router.post('/agendar', verifyToken, async (req, res) => {
    try {
        const { id_profissional, id_clinica, data_agendamento, horario, valor_consulta, nome_medico } = req.body;
        const id_paciente = req.userId;

        // Validação básica do valor
        const valorNumerico = Number(valor_consulta) || 0;

        // --- 1. SALVAR NO BANCO ---
        // Adicionada a coluna 'valor' aqui para corrigir o problema do zero
        const insertQuery = `
            INSERT INTO agendamentos 
            (id_paciente, id_profissional, id_clinica, data_agendamento, horario, valor, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'Confirmado')
        `;
        await pool.query(insertQuery, [id_paciente, id_profissional, id_clinica, data_agendamento, horario, valorNumerico]);

        // --- 2. CRIAR PREFERÊNCIA MERCADO PAGO ---
        const preference = new Preference(client);
        
        const response = await preference.create({
            body: {
                items: [
                    {
                        title: `Consulta com ${nome_medico}`,
                        quantity: 1,
                        unit_price: valorNumerico,
                        currency_id: 'BRL',
                    }
                ],
                back_urls: {
                    success: 'https://dagenda.com.br/dashboard/meus-agendamentos',
                    failure: 'https://dagenda.com.br/agendamento-erro',
                    pending: 'https://dagenda.com.br/agendamento-pendente'
                },
                auto_return: 'approved',
                binary_mode: true
            }
        });

        res.json({ init_point: response.init_point });

    } catch (error) {
        console.error("Erro ao processar agendamento:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. BUSCAR AGENDAMENTOS DO PACIENTE
router.get('/meus-agendamentos', verifyToken, async (req, res) => {
    try {
        const id_paciente = req.userId;
        const query = `
            SELECT 
                a.id, 
                a.data_agendamento, 
                a.horario, 
                COALESCE(a.status, 'Confirmado') as status,
                p.nome as nome_medico, 
                p.especialidade,
                c.nome_fantasia as nome_clinica
            FROM agendamentos a
            JOIN profissionais p ON a.id_profissional = p.id
            JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE a.id_paciente = ?
            ORDER BY a.id DESC
        `;
        const [rows] = await pool.query(query, [id_paciente]);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
        res.status(500).json({ error: "Erro ao carregar seus agendamentos" });
    }
});

// 5. EXCLUIR AGENDAMENTO
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_paciente = req.userId;
        const [result] = await pool.query('DELETE FROM agendamentos WHERE id = ? AND id_paciente = ?', [id, id_paciente]);

        if (result.affectedRows === 0) return res.status(403).json({ error: "Acesso negado." });
        res.json({ message: "Agendamento cancelado com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar agendamento:", error);
        res.status(500).json({ error: "Erro ao cancelar." });
    }
});

module.exports = router;