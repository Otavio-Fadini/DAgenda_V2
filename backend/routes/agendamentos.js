const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-8023357430156573-070213-ea790c5ea47494f7376c78501bda5942-307618485' 
});

// LISTAR PROFISSIONAIS
router.get('/profissionais', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, nome, especialidade, foto_perfil, valor_consulta, atende_convenio FROM profissionais ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar profissionais" });
    }
});

// LISTAR CLÍNICAS VINCULADAS AO PROFISSIONAL
router.get('/vinculos/clinicas/:id_profissional', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.nome_fantasia, c.foto_perfil, c.rua, c.numero, 
                   c.bairro, c.cidade, c.estado, c.cep, c.comodidades
            FROM usuarios_cnpj c
            JOIN vinculo_profissional_clinica v ON c.id = v.id_clinica
            WHERE v.id_profissional = ?
        `;
        const [clinicas] = await pool.query(query, [req.params.id_profissional]);
        res.json(clinicas);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar clínicas." });
    }
});

// BUSCAR ENDEREÇO DO PACIENTE
router.get('/meu-endereco', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT rua, numero, cidade, estado FROM usuarios_cpf WHERE id = ?', 
            [req.userId]
        );
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar endereço do paciente." });
    }
});

// BUSCAR HORÁRIOS DISPONÍVEIS
router.get('/horarios-disponiveis', verifyToken, async (req, res) => {
    try {
        const { id_profissional, data } = req.query;
        const [ano, mes, dia] = data.split('-');
        const dataObj = new Date(ano, mes - 1, dia);
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const nomeDia = diasSemana[dataObj.getDay()];

        const [prof] = await pool.query('SELECT duracao_sessao FROM profissionais WHERE id = ?', [id_profissional]);
        if (prof.length === 0) return res.status(404).json({ error: "Profissional não encontrado." });
        const duracaoMinutos = parseInt(prof[0].duracao_sessao || 30);

        const [disp] = await pool.query(
            'SELECT hora_inicio, hora_fim FROM disponibilidade_profissional WHERE profissional_id = ? AND dia_semana LIKE ? AND ativo = 1', 
            [id_profissional, `${nomeDia}%`]
        );

        if (disp.length === 0) return res.json([]);

        const [agendados] = await pool.query(
            'SELECT horario FROM agendamentos WHERE id_profissional = ? AND data_agendamento = ? AND status != "Cancelado"', 
            [id_profissional, data]
        );
        const horariosOcupados = agendados.map(a => a.horario.substring(0, 5));

        const horarios = [];
        let atual = new Date(`1970-01-01T${disp[0].hora_inicio.length === 5 ? disp[0].hora_inicio + ':00' : disp[0].hora_inicio}`);
        const fim = new Date(`1970-01-01T${disp[0].hora_fim.length === 5 ? disp[0].hora_fim + ':00' : disp[0].hora_fim}`);

        while (atual < fim) {
            const horaStr = atual.toTimeString().substring(0, 5);
            if (!horariosOcupados.includes(horaStr)) horarios.push(horaStr);
            atual.setMinutes(atual.getMinutes() + duracaoMinutos);
        }
        res.json(horarios);
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar horários." });
    }
});

// CRIAR AGENDAMENTO E PREFERÊNCIA DE PAGAMENTO
router.post('/agendar', verifyToken, async (req, res) => {
    try {
        const { id_profissional, id_clinica, data_agendamento, horario, valor_consulta, nome_medico } = req.body;
        const id_paciente = req.userId;
        const valorNumerico = Number(valor_consulta) || 0;

        await pool.query(
            'INSERT INTO agendamentos (id_paciente, id_profissional, id_clinica, data_agendamento, horario, valor, status) VALUES (?, ?, ?, ?, ?, ?, "Confirmado")',
            [id_paciente, id_profissional, id_clinica, data_agendamento, horario, valorNumerico]
        );

        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: [{ title: `Consulta com ${nome_medico}`, quantity: 1, unit_price: valorNumerico, currency_id: 'BRL' }],
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
        res.status(500).json({ error: error.message });
    }
});

// BUSCAR AGENDAMENTOS DO PACIENTE
router.get('/meus-agendamentos', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.data_agendamento, a.horario, COALESCE(a.status, 'Confirmado') as status,
                   p.nome as nome_medico, p.especialidade, c.nome_fantasia as nome_clinica
            FROM agendamentos a
            JOIN profissionais p ON a.id_profissional = p.id
            JOIN usuarios_cnpj c ON a.id_clinica = c.id
            WHERE a.id_paciente = ?
            ORDER BY a.id DESC
        `;
        const [rows] = await pool.query(query, [req.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar agendamentos" });
    }
});

// EXCLUIR AGENDAMENTO
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM agendamentos WHERE id = ? AND id_paciente = ?', [req.params.id, req.userId]);
        if (result.affectedRows === 0) return res.status(403).json({ error: "Acesso negado." });
        res.json({ message: "Agendamento cancelado com sucesso." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao cancelar." });
    }
});

module.exports = router;