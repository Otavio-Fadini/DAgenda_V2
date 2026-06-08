const router = require('express').Router();
const pool = require('../config/db');
const { verifyToken } = require('./auth');

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

        // ==========================================
        // NOVA LÓGICA DE TEMPO (BLOQUEAR PASSADO)
        // ==========================================
        const agora = new Date();
        const dataHojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
        const isHoje = (data === dataHojeStr);
        const horaAtualStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        // ==========================================

        const horarios = [];
        let atual = new Date(`1970-01-01T${disp[0].hora_inicio.length === 5 ? disp[0].hora_inicio + ':00' : disp[0].hora_inicio}`);
        const fim = new Date(`1970-01-01T${disp[0].hora_fim.length === 5 ? disp[0].hora_fim + ':00' : disp[0].hora_fim}`);

        while (true) {
            const fimDestaConsulta = new Date(atual.getTime() + duracaoMinutos * 60000);
            if (fimDestaConsulta > fim) break;

            const horaStr = atual.toTimeString().substring(0, 5);
            
            // Verifica se está livre E (Se não for hoje OU se a hora for maior que a atual)
            if (!horariosOcupados.includes(horaStr)) {
                if (!isHoje || horaStr > horaAtualStr) {
                    horarios.push(horaStr);
                }
            }
            
            atual.setMinutes(atual.getMinutes() + duracaoMinutos);
        }
        
        res.json(horarios);
    } catch (error) {
        console.error("Erro ao gerar horários:", error);
        res.status(500).json({ error: "Erro ao gerar horários.", motivoReal: error.message });
    }
});

// ==========================================
// ROTA: PRÉ-AGENDAR CONSULTA (Regra 24h)
// ==========================================
router.post('/agendar', verifyToken, async (req, res) => {
    try {
        const { id_profissional, id_clinica, data_agendamento, horario, valor_consulta } = req.body;
        const id_paciente = req.userId;
        const valorNumerico = Number(valor_consulta) || 0;

        // AQUI: Grava o status como 'Pendente pagamento' e regista a hora da criação (NOW())
        await pool.query(
            'INSERT INTO agendamentos (id_paciente, id_profissional, id_clinica, data_agendamento, horario, valor, status, data_criacao) VALUES (?, ?, ?, ?, ?, ?, "Pendente pagamento", NOW())',
            [id_paciente, id_profissional, id_clinica, data_agendamento, horario, valorNumerico]
        );

        res.status(201).json({ message: "Pré-agendamento realizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ error: "Erro interno ao agendar." });
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