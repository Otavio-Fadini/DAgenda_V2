const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

// Adicione estas linhas no topo do arquivo
const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-8023357430156573-070213-ea790c5ea47494f7376c78501bda5942-307618485' });

// 1. LISTAR TODOS OS PROFISSIONAIS
// Retorna os dados necessários para o paciente escolher o médico no agendamento
router.get('/profissionais', async (req, res) => {
    try {
        const query = `
            SELECT id, nome, especialidade, foto_perfil, valor_consulta, atende_convenio 
            FROM profissionais 
            ORDER BY nome ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        res.status(500).json({ error: "Erro ao buscar profissionais" });
    }
});

// 2. LISTAR CLÍNICAS ONDE O MÉDICO ATENDE
// Útil para preencher o select de unidades após escolher o médico
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

// 3. PAGAMENTO E CRIAÇÃO DO AGENDAMENTO (AJUSTE)
router.post('/agendar', verifyToken, async (req, res) => {
    try {
        const { id_profissional, id_clinica, data_agendamento, horario, valor_consulta, nome_medico } = req.body;
        const id_paciente = req.userId;

        // 1. Cria a preferência no Mercado Pago
        const preference = new Preference(client);
        
        const response = await preference.create({
            body: {
                items: [
                    {
                        title: `Consulta com ${nome_medico}`,
                        quantity: 1,
                        unit_price: Number(valor_consulta),
                        currency_id: 'BRL',
                    }
                ],
                // CORREÇÃO: Defina todas as chaves obrigatórias aqui
                back_urls: {
                    success: 'http://localhost:3000/dashboard/meus-agendamentos',
                    failure: 'http://localhost:3000/agendamento-erro',
                    pending: 'http://localhost:3000/agendamento-pendente'
                },
                // Se usar 'approved', é OBRIGATÓRIO ter a URL de success definida acima
                auto_return: 'approved', 
                binary_mode: true // Opcional: força apenas pagamentos aprovados ou rejeitados
            }
        });

        // 2. Retorna o link para o front-end
        res.json({ init_point: response.init_point });

    } catch (error) {
        console.error("Erro ao criar preferência de pagamento:", error);
        // Exibindo o erro detalhado que o Mercado Pago te enviou
        res.status(500).json({ error: error.message });
    }
});

// 4. BUSCAR AGENDAMENTOS DO PACIENTE (Dashboard e Tela Meus Agendamentos)
// Formata data e hora diretamente no SQL para o padrão brasileiro
router.get('/meus-agendamentos', verifyToken, async (req, res) => {
    try {
        const id_paciente = req.userId;
        const query = `
            SELECT 
                a.id, 
                DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') as data_agendamento, 
                TIME_FORMAT(a.horario, '%H:%i') as horario, 
                COALESCE(a.status, 'Confirmado') as status,
                p.nome as nome_medico, 
                p.especialidade,
                c.nome_fantasia as nome_clinica
            FROM agendamentos a
            JOIN profissionais p ON a.id_profissional = p.id
            JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE a.id_paciente = ?
            ORDER BY a.data_agendamento DESC, a.horario ASC
        `;
        const [rows] = await pool.query(query, [id_paciente]);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao carregar agendamentos do paciente:", error);
        res.status(500).json({ error: "Erro ao carregar seus agendamentos" });
    }
});

// 5. EXCLUIR/CANCELAR AGENDAMENTO
// Segurança reforçada: só deleta se o agendamento pertencer ao usuário logado
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_paciente = req.userId;

        const [result] = await pool.query(
            'DELETE FROM agendamentos WHERE id = ? AND id_paciente = ?', 
            [id, id_paciente]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ 
                error: "Acesso negado ou agendamento não encontrado para este usuário." 
            });
        }

        res.json({ message: "Agendamento cancelado com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar agendamento:", error);
        res.status(500).json({ error: "Erro ao processar o cancelamento." });
    }
});

module.exports = router;