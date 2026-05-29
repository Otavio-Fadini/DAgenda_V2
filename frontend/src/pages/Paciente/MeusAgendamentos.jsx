import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, Chip, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, CircularProgress, Stack, Avatar, IconButton 
} from '@mui/material';
import { 
    Calendar, Clock, CreditCard, XCircle, Paperclip, CheckCircle, 
    AlertCircle, FileText, Upload, Stethoscope, FileUp 
} from 'lucide-react';
import api from '../../services/api'; // Ajuste o caminho conforme necessário

const MeusAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para o Modal de Cancelamento
    const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');
    const [loadingAcao, setLoadingAcao] = useState(false);

    // Estados para o Modal de Anexar Exame
    const [modalExameOpen, setModalExameOpen] = useState(false);
    const [arquivoExame, setArquivoExame] = useState(null);
    const [nomeArquivo, setNomeArquivo] = useState('');

    useEffect(() => {
        carregarAgendamentos();
    }, []);

    const carregarAgendamentos = async () => {
        setLoading(true);
        try {
            // Esta rota será criada/ajustada no backend depois
            const response = await api.get('/paciente/meus-agendamentos');
            setAgendamentos(response.data);
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DA REGRA DOS 7 DIAS ---
    const verificarPodeCancelar = (dataAgendamento) => {
        const dataConsulta = new Date(dataAgendamento);
        const hoje = new Date();
        const diferencaTempo = dataConsulta.getTime() - hoje.getTime();
        const diferencaDias = Math.ceil(diferencaTempo / (1000 * 3600 * 24));
        return diferencaDias >= 7;
    };

    // --- ACÇÕES DOS BOTÕES ---
    const handlePagarAgora = (id) => {
        // Preparado para a Fase 4 (Mercado Pago)
        alert(`Iniciando pagamento para o agendamento ${id}. (Integração na Fase 4)`);
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
            await api.put(`/paciente/agendamento/${agendamentoSelecionado.id}/cancelar`, {
                motivo: motivoCancelamento
            });
            alert("Consulta cancelada e reembolso solicitado (se aplicável).");
            setModalCancelarOpen(false);
            carregarAgendamentos(); // Recarrega a lista
        } catch (error) {
            console.error(error);
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
            reader.onloadend = () => {
                setArquivoExame(reader.result); // Guarda em Base64
            };
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
            console.error(error);
            alert("Erro ao enviar o exame.");
        } finally {
            setLoadingAcao(false);
        }
    };

    // --- FUNÇÕES DE ESTILIZAÇÃO VISUAL ---
    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pendente pagamento': return { color: '#F59E0B', bg: '#FEF3C7', icon: <Clock size={16} /> };
            case 'Agendado': return { color: '#10B981', bg: '#D1FAE5', icon: <CheckCircle size={16} /> };
            case 'Concluido': return { color: '#3B82F6', bg: '#DBEAFE', icon: <FileText size={16} /> };
            case 'Cancelado': return { color: '#EF4444', bg: '#FEE2E2', icon: <XCircle size={16} /> };
            default: return { color: '#64748B', bg: '#F1F5F9', icon: <AlertCircle size={16} /> };
        }
    };

    // Função auxiliar para formatar a data (DD/MM/YYYY)
    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-1px' }}>
                    Meus Agendamentos
                </Typography>
                <Typography variant="body1" color="#64748B" fontWeight={500}>
                    Acompanhe as suas consultas, pagamentos e anexos clínicos.
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: '#32B5FE' }} />
                </Box>
            ) : agendamentos.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0', bgcolor: 'transparent' }}>
                    <Calendar size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" fontWeight={800} color="#64748B">Nenhum agendamento encontrado</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {agendamentos.map((agendamento) => {
                        const statusCfg = getStatusConfig(agendamento.status);
                        const podeCancelar = verificarPodeCancelar(agendamento.data_agendamento);

                        return (
                            <Grid item xs={12} key={agendamento.id}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3, transition: 'all 0.2s', '&:hover': { borderColor: '#32B5FE', boxShadow: '0 4px 20px rgba(50, 181, 254, 0.1)' } }}>
                                    
                                    {/* INFORMAÇÕES DO MÉDICO E DATA */}
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Avatar src={agendamento.foto_perfil} sx={{ width: 60, height: 60, bgcolor: '#F1F5F9', color: '#32B5FE' }}>
                                            <Stethoscope size={30} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Typography>
                                            <Typography variant="body2" color="#64748B" fontWeight={600} sx={{ mb: 1 }}>{agendamento.especialidade}</Typography>
                                            
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#0F172A' }}>
                                                    <Calendar size={16} />
                                                    <Typography variant="body2" fontWeight={700}>{formatarData(agendamento.data_agendamento)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#0F172A' }}>
                                                    <Clock size={16} />
                                                    <Typography variant="body2" fontWeight={700}>{agendamento.horario.substring(0,5)}</Typography>
                                                </Box>
                                                <Chip 
                                                    icon={statusCfg.icon} label={agendamento.status} size="small"
                                                    sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 800, '& .MuiChip-icon': { color: statusCfg.color } }}
                                                />
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* BOTÕES DE AÇÃO CONDICIONAIS */}
                                    <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
                                        
                                        {/* SE ESTIVER PENDENTE DE PAGAMENTO */}
                                        {agendamento.status === 'Pendente pagamento' && (
                                            <>
                                                <Button variant="outlined" color="error" startIcon={<XCircle size={18} />} onClick={() => abrirModalCancelar(agendamento)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flexGrow: { xs: 1, md: 0 } }}>
                                                    Cancelar
                                                </Button>
                                                <Button variant="contained" startIcon={<CreditCard size={18} />} onClick={() => handlePagarAgora(agendamento.id)} sx={{ bgcolor: '#32B5FE', borderRadius: '10px', textTransform: 'none', fontWeight: 800, flexGrow: { xs: 1, md: 0 }, boxShadow: 'none', '&:hover': { bgcolor: '#0284C7', boxShadow: 'none' } }}>
                                                    Pagar Agora
                                                </Button>
                                            </>
                                        )}

                                        {/* SE ESTIVER AGENDADO (JÁ PAGO) */}
                                        {agendamento.status === 'Agendado' && (
                                            <>
                                                <Button variant="outlined" disabled={!podeCancelar} color="error" startIcon={<XCircle size={18} />} onClick={() => abrirModalCancelar(agendamento)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flexGrow: { xs: 1, md: 0 } }}>
                                                    Cancelar
                                                </Button>
                                                <Button variant="contained" startIcon={<Paperclip size={18} />} onClick={() => abrirModalExame(agendamento)} sx={{ bgcolor: '#0F172A', borderRadius: '10px', textTransform: 'none', fontWeight: 800, flexGrow: { xs: 1, md: 0 }, boxShadow: 'none', '&:hover': { bgcolor: '#1E293B' } }}>
                                                    Anexar Exame
                                                </Button>
                                            </>
                                        )}

                                        {/* SE ESTIVER AGENDADO MAS NÃO PODE CANCELAR (Aviso) */}
                                        {agendamento.status === 'Agendado' && !podeCancelar && (
                                            <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 0.5 }}>
                                                * Cancelamento apenas com 7 dias de antecedência.
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* MODAL DE CANCELAMENTO */}
            <Dialog open={modalCancelarOpen} onClose={() => setModalCancelarOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">Cancelar Consulta</Typography>
                    <Typography variant="body2" color="text.secondary">Se aplicável, o estorno será processado via Mercado Pago.</Typography>
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
                        {loadingAcao ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Cancelamento'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE ANEXAR EXAME */}
            <Dialog open={modalExameOpen} onClose={() => setModalExameOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={900} color="#0F172A">Anexar Documento / Exame</Typography>
                    <Typography variant="body2" color="text.secondary">Envie os resultados para o médico avaliar antes da consulta.</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, border: '2px dashed #E2E8F0', borderRadius: '16px', p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
                        <input type="file" id="arquivo-exame" hidden onChange={handleFileChange} accept=".pdf,image/*" />
                        <label htmlFor="arquivo-exame" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FileUp size={40} color="#32B5FE" style={{ marginBottom: 16 }} />
                            <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Clique para selecionar o ficheiro</Typography>
                            <Typography variant="caption" color="#64748B">PDF, JPG ou PNG (Max 5MB)</Typography>
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
                    <Button variant="contained" onClick={enviarExame} disabled={loadingAcao || !arquivoExame} sx={{ bgcolor: '#0F172A', borderRadius: '10px', fontWeight: 800, boxShadow: 'none', '&:hover': { bgcolor: '#1E293B' } }}>
                        {loadingAcao ? <CircularProgress size={24} color="inherit" /> : 'Enviar Ficheiro'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeusAgendamentos;