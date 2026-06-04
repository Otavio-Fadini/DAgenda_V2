import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, Chip, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, CircularProgress, Stack, Avatar, 
    Divider, InputAdornment, Tooltip, IconButton, Tabs, Tab 
} from '@mui/material';
import { 
    Calendar, Clock, CreditCard, XCircle, Paperclip, CheckCircle, 
    AlertCircle, FileText, Stethoscope, FileUp, Search, FilterX 
} from 'lucide-react';
import api from '../../services/api';

const MeusAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Filtro
    const [filtroData, setFiltroData] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos'); 
    const [buscaTexto, setBuscaTexto] = useState('');

    const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');
    const [loadingAcao, setLoadingAcao] = useState(false);

    const [modalExameOpen, setModalExameOpen] = useState(false);
    const [arquivoExame, setArquivoExame] = useState(null);
    const [nomeArquivo, setNomeArquivo] = useState('');

    useEffect(() => {
        carregarAgendamentos();
    }, []);

    const carregarAgendamentos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/paciente/meus-agendamentos');
            
            // Filtro de segurança para remover duplicatas
            const agendamentosUnicos = response.data.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            setAgendamentos(agendamentosUnicos);
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LÓGICA DE FILTRAGEM
    // ==========================================
    const limparFiltros = () => {
        setFiltroData('');
        setFiltroStatus('Todos');
        setBuscaTexto('');
    };

    const agendamentosFiltrados = agendamentos.filter((agendamento) => {
        // 1. Filtro por Texto (Nome do médico ou especialidade)
        const termoBusca = buscaTexto.toLowerCase();
        const matchNome = (agendamento.nome_medico || '').toLowerCase().includes(termoBusca) || 
                          (agendamento.especialidade || '').toLowerCase().includes(termoBusca);
        
        // 2. Filtro por Data
        const matchData = filtroData ? (agendamento.data_agendamento || '').startsWith(filtroData) : true;
        
        // 3. Filtro por Status
        const matchStatus = filtroStatus === 'Todos' || agendamento.status === filtroStatus;

        return matchNome && matchData && matchStatus;
    });

    // ==========================================

    const verificarPodeCancelar = (dataAgendamento) => {
        const dataConsulta = new Date(dataAgendamento);
        const hoje = new Date();
        const diferencaDias = Math.ceil((dataConsulta.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        return diferencaDias >= 7;
    };

    const handlePagarAgora = async (id) => {
        setLoadingAcao(true);
        try {
            const response = await api.post(`/paciente/agendamento/${id}/pagar`);
            if (response.data.link) {
                window.location.href = response.data.link;
            } else {
                alert("Não foi possível gerar o link de pagamento.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com a plataforma de pagamentos.");
        } finally {
            setLoadingAcao(false);
        }
    };

    const abrirModalCancelar = (agendamento) => {
        setAgendamentoSelecionado(agendamento);
        setMotivoCancelamento('');
        setModalCancelarOpen(true);
    };

    const confirmarCancelamento = async () => {
        if (!motivoCancelamento.trim()) return alert("Por favor, informe o motivo do cancelamento.");
        setLoadingAcao(true);
        try {
            await api.put(`/paciente/agendamento/${agendamentoSelecionado.id}/cancelar`, { motivo: motivoCancelamento });
            alert("Consulta cancelada e reembolso solicitado (se aplicável).");
            setModalCancelarOpen(false);
            carregarAgendamentos();
        } catch (error) {
            alert("Erro ao cancelar a consulta.");
        } finally {
            setLoadingAcao(false);
        }
    };

    const abrirModalExame = (agendamento) => {
        setAgendamentoSelecionado(agendamento);
        setArquivoExame(null);
        setNomeArquivo('');
        setModalExameOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNomeArquivo(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setArquivoExame(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const enviarExame = async () => {
        if (!arquivoExame) return alert("Selecione um ficheiro primeiro.");
        setLoadingAcao(true);
        try {
            await api.post('/paciente/exames', {
                agendamento_id: agendamentoSelecionado.id,
                nome_arquivo: nomeArquivo,
                arquivo_base64: arquivoExame
            });
            alert("Exame anexado com sucesso!");
            setModalExameOpen(false);
        } catch (error) {
            alert("Erro ao enviar o exame.");
        } finally {
            setLoadingAcao(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pendente pagamento': return { color: '#B45309', bg: '#FEF3C7', icon: <Clock size={16} /> };
            case 'Agendado': return { color: '#047857', bg: '#D1FAE5', icon: <CheckCircle size={16} /> };
            case 'Concluido': return { color: '#1D4ED8', bg: '#DBEAFE', icon: <FileText size={16} /> };
            case 'Cancelado': return { color: '#B91C1C', bg: '#FEE2E2', icon: <XCircle size={16} /> };
            default: return { color: '#475569', bg: '#F1F5F9', icon: <AlertCircle size={16} /> };
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Estilo dos inputs da barra de filtros
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', bgcolor: '#FFFFFF', transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-1px' }}>
                    Meus Agendamentos
                </Typography>
                <Typography variant="body1" color="#64748B" fontWeight={500}>
                    Acompanhe as suas consultas, pagamentos e anexos clínicos.
                </Typography>
            </Box>

            {/* 1. BARRA DE PESQUISA E DATA */}
            <Paper elevation={0} sx={{ 
                p: 2.5, mb: 2, borderRadius: '20px', border: '1px solid #F1F5F9', 
                display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', 
                bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
            }}>
                <TextField
                    placeholder="Buscar médico ou especialidade..."
                    size="small"
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '250px', ...modernInputStyle }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Search size={18} color="#94A3B8"/></InputAdornment>) }}
                />

                <TextField
                    type="date"
                    size="small"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    sx={{ width: 180, ...modernInputStyle }}
                    InputProps={{ sx: { fontWeight: 700, color: '#0F172A' } }}
                />

                <Tooltip title="Limpar Filtros" arrow>
                    <IconButton onClick={limparFiltros} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '12px', '&:hover': { bgcolor: '#FECACA' }, width: 40, height: 40 }}>
                        <FilterX size={20} />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* 2. ABAS DE STATUS */}
            <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 4 }}>
                <Tabs 
                    value={filtroStatus} 
                    onChange={(e, newValue) => setFiltroStatus(newValue)} 
                    variant="scrollable" 
                    scrollButtons="auto"
                    sx={{ 
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', minWidth: 'auto', px: 3 }, 
                        '& .Mui-selected': { color: '#32B5FE' }, 
                        '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3, borderRadius: '3px 3px 0 0' } 
                    }}
                >
                    <Tab label="Todos" value="Todos" />
                    <Tab label="Agendados" value="Agendado" />
                    <Tab label="Aguardando Pagamento" value="Pendente pagamento" />
                    <Tab label="Concluídos" value="Concluido" />
                    <Tab label="Cancelados" value="Cancelado" />
                </Tabs>
            </Box>

            {/* 3. LISTA DE AGENDAMENTOS */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: '#32B5FE' }} />
                </Box>
            ) : agendamentosFiltrados.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0', bgcolor: 'transparent' }}>
                    <Calendar size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" fontWeight={800} color="#64748B">Nenhum agendamento encontrado.</Typography>
                    <Typography variant="body2" color="#94A3B8" fontWeight={500}>Tente alterar os filtros de busca para encontrar o que procura.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {agendamentosFiltrados.map((agendamento) => {
                        const statusCfg = getStatusConfig(agendamento.status);
                        const podeCancelar = verificarPodeCancelar(agendamento.data_agendamento);

                        return (
                            <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={agendamento.id}>
                                {/* 👇 O SEGREDO ESTÁ AQUI: width, maxWidth e boxSizing "blindam" a largura do card 👇 */}
                                <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { borderColor: '#32B5FE', boxShadow: '0 10px 30px -10px rgba(50, 181, 254, 0.15)', transform: 'translateY(-4px)' }, opacity: agendamento.status === 'Cancelado' ? 0.75 : 1 }}>
                                    
                                    {/* TOPO: FOTO E NOME */}
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, width: '100%' }}>
                                        <Avatar src={agendamento.foto_perfil} sx={{ width: 56, height: 56, bgcolor: '#F8FAFC', color: '#32B5FE', border: '2px solid #F1F5F9', flexShrink: 0 }}>
                                            <Stethoscope size={28} />
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            {/* 👇 wordBreak: 'break-word' faz o texto ir para a linha de baixo naturalmente se for muito grande 👇 */}
                                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2, wordBreak: 'break-word' }}>
                                                Dr(a). {agendamento.nome_medico}
                                            </Typography>
                                            <Typography variant="body2" color="#32B5FE" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                                {agendamento.especialidade}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* MEIO: DATA, HORA E STATUS */}
                                    <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1, width: '100%' }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip icon={<Calendar size={16} />} label={formatarData(agendamento.data_agendamento)} sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 800, borderRadius: '10px' }} />
                                            <Chip icon={<Clock size={16} />} label={agendamento.horario.substring(0,5)} sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 800, borderRadius: '10px' }} />
                                        </Box>
                                        
                                        {/* Trava de largura também no chip de status para não alargar o card */}
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: statusCfg.bg, color: statusCfg.color, px: 2, py: 1, borderRadius: '10px', alignSelf: 'flex-start', maxWidth: '100%', overflow: 'hidden' }}>
                                            {statusCfg.icon}
                                            <Typography variant="body2" fontWeight={800} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agendamento.status}</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0', mb: 3 }} />

                                    {/* BASE: BOTÕES */}
                                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                                        {agendamento.status === 'Pendente pagamento' && (
                                            <>
                                                <Button fullWidth variant="contained" startIcon={<CreditCard size={18} />} onClick={() => handlePagarAgora(agendamento.id)} sx={{ color: '#FFFFFF', bgcolor: '#0F172A', borderRadius: '12px', textTransform: 'none', fontWeight: 800, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#32B5FE' } }}>
                                                    Pagar Consulta
                                                </Button>
                                                <Button fullWidth variant="outlined" color="error" startIcon={<XCircle size={18} />} onClick={() => abrirModalCancelar(agendamento)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2 }}>
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}

                                        {agendamento.status === 'Agendado' && (
                                            <>
                                                <Button fullWidth variant="contained" startIcon={<Paperclip size={18} />} onClick={() => abrirModalExame(agendamento)} sx={{ color: '#FFFFFF', bgcolor: '#0F172A', borderRadius: '12px', textTransform: 'none', fontWeight: 800, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#32B5FE' } }}>
                                                    Anexar Exame
                                                </Button>
                                                <Button fullWidth variant="outlined" disabled={!podeCancelar} color="error" startIcon={<XCircle size={18} />} onClick={() => abrirModalCancelar(agendamento)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2 }}>
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}

                                        {agendamento.status === 'Agendado' && !podeCancelar && (
                                            <Typography variant="caption" color="error" textAlign="center" sx={{ display: 'block', lineHeight: 1.4, mt: 0.5 }}>
                                                * Cancelamento apenas <br /> com 7 dias de antecedência.
                                            </Typography>
                                        )}
                                        
                                        {(agendamento.status === 'Concluido' || agendamento.status === 'Cancelado') && (
                                            <Typography variant="body2" color="#94A3B8" fontWeight={700} textAlign="center" sx={{ py: 1 }}>
                                                Nenhuma ação disponível.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* MODAIS (Mantidos 100% inalterados) */}
            <Dialog open={modalCancelarOpen} onClose={() => setModalCancelarOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">Cancelar Consulta</Typography>
                    <Typography variant="body2" color="text.secondary">Se aplicável, o estorno será processado.</Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField 
                        fullWidth multiline rows={3} label="Motivo do Cancelamento (Obrigatório)" 
                        value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)}
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setModalCancelarOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>Voltar</Button>
                    <Button variant="contained" color="error" onClick={confirmarCancelamento} disabled={loadingAcao} sx={{ borderRadius: '10px', fontWeight: 800, boxShadow: 'none' }}>
                        {loadingAcao ? <CircularProgress size={24} color="inherit" /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={modalExameOpen} onClose={() => setModalExameOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">Anexar Exame</Typography>
                    <Typography variant="body2" color="text.secondary">Envie os resultados para o médico.</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, border: '2px dashed #E2E8F0', borderRadius: '16px', p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
                        <input type="file" id="arquivo-exame" hidden onChange={handleFileChange} accept=".pdf,image/*" />
                        <label htmlFor="arquivo-exame" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FileUp size={40} color="#32B5FE" style={{ marginBottom: 16 }} />
                            <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Selecionar ficheiro</Typography>
                        </label>
                    </Box>
                    {nomeArquivo && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #BBF7D0' }}>
                            <CheckCircle size={18} color="#16A34A" />
                            <Typography variant="body2" fontWeight={700} color="#166534" sx={{ wordBreak: 'break-all' }}>{nomeArquivo}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setModalExameOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>Cancelar</Button>
                    <Button variant="contained" onClick={enviarExame} disabled={loadingAcao || !arquivoExame} sx={{ color: '#FFFFFF', bgcolor: '#0F172A', borderRadius: '12px', textTransform: 'none', fontWeight: 800, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#32B5FE' } }}>
                        {loadingAcao ? <CircularProgress size={24} color="inherit" /> : 'ENVIAR'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeusAgendamentos;