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
// ROTA: LISTAR OS AGENDAMENTOS DO PACIENTE
// ==========================================
router.get('/meus-agendamentos', verifyToken, async (req, res) => {
    const pacienteId = req.userId;

    try {
        const query = `
            SELECT 
                a.id, a.data_agendamento, a.horario, a.status, a.link_pagamento,
                p.nome AS nome_medico, p.especialidade, p.foto_perfil
            FROM agendamentos a
            INNER JOIN profissionais p ON a.id_profissional = p.id
            WHERE a.id_paciente = ?
            ORDER BY a.data_agendamento DESC, a.horario DESC
        `;
        
        const [agendamentos] = await pool.query(query, [pacienteId]);
        res.json(agendamentos);

    } catch (error) {
        console.error("Erro ao listar agendamentos do paciente:", error);
        res.status(500).json({ error: "Erro interno.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: CANCELAR AGENDAMENTO
// ==========================================
router.put('/agendamento/:id/cancelar', verifyToken, async (req, res) => {
    const pacienteId = req.userId;
    const agendamentoId = req.params.id;
    const { motivo } = req.body;

    try {
        // 1. Verifica se o agendamento pertence mesmo a este paciente
        const [agendamento] = await pool.query(
            `SELECT id, status FROM agendamentos WHERE id = ? AND id_paciente = ?`, 
            [agendamentoId, pacienteId]
        );

        if (agendamento.length === 0) {
            return res.status(404).json({ error: "Agendamento não encontrado ou não autorizado." });
        }

        // 2. Atualiza o status e regista o motivo e a data do cancelamento
        const queryUpdate = `
            UPDATE agendamentos 
            SET status = 'Cancelado', motivo_cancelamento = ?, data_cancelamento = NOW() 
            WHERE id = ?
        `;
        await pool.query(queryUpdate, [motivo, agendamentoId]);

        res.json({ message: "Agendamento cancelado com sucesso." });

    } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        res.status(500).json({ error: "Erro ao processar o cancelamento.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: ANEXAR EXAME (BASE64)
// ==========================================
router.post('/exames', verifyToken, async (req, res) => {
    const pacienteId = req.userId;
    const { agendamento_id, nome_arquivo, arquivo_base64 } = req.body;

    if (!agendamento_id || !nome_arquivo || !arquivo_base64) {
        return res.status(400).json({ error: "Dados do exame incompletos." });
    }

    try {
        // 1. Segurança: Garantir que o paciente não está a anexar exames na consulta de outra pessoa
        const [agendamento] = await pool.query(
            `SELECT id FROM agendamentos WHERE id = ? AND id_paciente = ?`, 
            [agendamento_id, pacienteId]
        );

        if (agendamento.length === 0) {
            return res.status(403).json({ error: "Acesso negado a este agendamento." });
        }

        // 2. Insere o ficheiro na tabela de exames
        const queryInsert = `
            INSERT INTO exames_agendamento (agendamento_id, nome_arquivo, arquivo_base64)
            VALUES (?, ?, ?)
        `;
        await pool.query(queryInsert, [agendamento_id, nome_arquivo, arquivo_base64]);

        res.status(201).json({ message: "Exame anexado com sucesso!" });

    } catch (error) {
        console.error("Erro ao anexar exame:", error);
        res.status(500).json({ error: "Erro ao guardar o ficheiro.", motivoReal: error.message });
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

// ==========================================
// ROTA: GERAR LINK DE PAGAMENTO (MERCADO PAGO)
// ==========================================
router.post('/agendamento/:id/pagar', verifyToken, async (req, res) => {
    const pacienteId = req.userId;
    const agendamentoId = req.params.id;

    try {
        // 1. Busca o valor da consulta e o nome do médico
        const [rows] = await pool.query(`
            SELECT a.id, p.nome, p.valor_consulta 
            FROM agendamentos a
            JOIN profissionais p ON a.id_profissional = p.id
            WHERE a.id = ? AND a.id_paciente = ?
        `, [agendamentoId, pacienteId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Agendamento não encontrado." });
        }

        const consulta = rows[0];
        const valor = parseFloat(consulta.valor_consulta) || 150.00;

        // 2. Puxar a credencial do ficheiro .env
        const accessToken = process.env.MP_ACCESS_TOKEN;

        // Trava de segurança caso esqueça de colocar no .env
        if (!accessToken) {
            console.error("ERRO GRAVE: MP_ACCESS_TOKEN não está definido no ficheiro .env");
            return res.status(500).json({ error: "Erro de configuração no servidor de pagamentos." });
        }

        // 3. Integração REST com Mercado Pago
        const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: [
                    {
                        title: `DAGENDA - Consulta Dr(a). ${consulta.nome}`,
                        description: `Pagamento de consulta médica (Ref: ${agendamentoId})`,
                        unit_price: valor,
                        quantity: 1,
                        currency_id: "BRL"
                    }
                ],
                external_reference: agendamentoId.toString(),
                auto_return: "approved",
                
                // 👇 A BALA DE PRATA: Adicione esta linha exata! 👇
                notification_url: "https://www.dagenda.com.br/api/webhook/mercadopago",
                
                // URLS DE RETORNO APONTANDO PARA O DOMÍNIO OFICIAL EM HTTPS:
                back_urls: {
                    success: "https://www.dagenda.com.br/paciente/agendamentos",
                    failure: "https://www.dagenda.com.br/paciente/agendamentos",
                    pending: "https://www.dagenda.com.br/paciente/agendamentos"
                }
            })
        });

        const mpData = await mpResponse.json();

        if (mpData.id) {
            // Guarda o link de pagamento na tabela para histórico
            await pool.query('UPDATE agendamentos SET link_pagamento = ? WHERE id = ?', [mpData.init_point, agendamentoId]);
            
            // Devolve o link mágico (init_point) para o React
            res.json({ link: mpData.init_point });
        } else {
            // O F12 do navegador ou o log da AWS vai mostrar exatamente qual foi o erro
            console.error("Erro devolvido pelo Mercado Pago:", mpData);
            res.status(500).json({ error: "Falha ao gerar link do Mercado Pago.", detalhes: mpData });
        }

    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        res.status(500).json({ error: "Erro interno no servidor.", motivoReal: error.message });
    }
});

module.exports = router;