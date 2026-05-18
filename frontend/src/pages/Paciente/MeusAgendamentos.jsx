import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Avatar, Divider, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Calendar, Clock, MapPin, Trash2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api'; // USANDO O SEU SERVIÇO CENTRALIZADO

const MeusAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // useCallback evita que a função seja recriada sem necessidade, 
    // ajudando na estabilidade da navegação
    const carregarAgendamentos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/agendamentos/meus-agendamentos');
            setAgendamentos(res.data);
        } catch (err) { 
            console.error("Erro ao carregar agendamentos", err);
            if (err.response?.status === 401) {
                // Se o token estiver inválido, manda pro login
                window.location.href = '/';
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        carregarAgendamentos(); 
    }, [carregarAgendamentos]);

    const cancelarAgendamento = async (id) => {
        if (window.confirm("Deseja realmente cancelar este agendamento?")) {
            try {
                await api.delete(`/agendamentos/${id}`);
                // Recarrega a lista após deletar
                carregarAgendamentos();
            } catch (err) { 
                alert("Erro ao cancelar o agendamento."); 
            }
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px' }}>
                        Meus Agendamentos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Gerencie suas consultas marcadas e histórico.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <IconButton onClick={carregarAgendamentos} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                        <RefreshCw size={18} color="#64748b" />
                    </IconButton>
                    <Chip 
                        icon={<CheckCircle2 size={16} color="white" />} 
                        label={`${agendamentos.length} Consultas`} 
                        sx={{ fontWeight: 800, bgcolor: '#0f172a', color: 'white', px: 1 }} 
                    />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                    <CircularProgress sx={{ color: '#32B5FE' }} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {agendamentos.length > 0 ? agendamentos.map((ag) => (
                        <Grid item xs={12} md={6} lg={4} key={ag.id}>
                            <Paper elevation={0} sx={{ 
                                p: 3, borderRadius: 6, border: '1px solid #e2e8f0', 
                                bgcolor: 'white', transition: '0.3s', 
                                '&:hover': { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', borderColor: '#32B5FE' } 
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Chip 
                                        label={ag.status || 'Confirmado'} 
                                        size="small" 
                                        sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1.5 }} 
                                    />
                                    <Tooltip title="Cancelar Agendamento">
                                        <IconButton onClick={() => cancelarAgendamento(ag.id)} size="small" sx={{ color: '#f87171', '&:hover': { bgcolor: '#fef2f2' } }}>
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#f1f5f9', color: '#32B5FE', fontWeight: 800, width: 50, height: 50, border: '1px solid #e2e8f0' }}>
                                        {ag.nome_medico ? ag.nome_medico[0] : 'M'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
                                            {ag.nome_medico}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#32B5FE', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {ag.especialidade}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ bgcolor: '#f8fafc', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
                                            <Calendar size={14} color="#32B5FE" />
                                        </Box>
                                        <Typography variant="body2" fontWeight={700} color="#475569">{ag.data_agendamento}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ bgcolor: '#f8fafc', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
                                            <Clock size={14} color="#32B5FE" />
                                        </Box>
                                        <Typography variant="body2" fontWeight={700} color="#475569">{ag.horario}h</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ bgcolor: '#f8fafc', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
                                            <MapPin size={14} color="#32B5FE" />
                                        </Box>
                                        <Typography variant="body2" fontWeight={700} color="#475569" noWrap>{ag.nome_clinica}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    )) : (
                        <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
                            <AlertCircle size={60} color="#cbd5e1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" fontWeight={800} color="#94a3b8">Nenhuma consulta agendada.</Typography>
                            <Typography variant="body2" color="#cbd5e1" fontWeight={600}>Suas marcações aparecerão aqui.</Typography>
                        </Box>
                    )}
                </Grid>
            )}
        </Box>
    );
};

export default MeusAgendamentos;