import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Chip, Avatar, Divider, IconButton, Tooltip, CircularProgress, Fade } from '@mui/material';
import { Calendar, Clock, MapPin, Trash2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api'; 

const MeusAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    const carregarAgendamentos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/agendamentos/meus-agendamentos');
            setAgendamentos(res.data);
        } catch (err) { 
            console.error("Erro ao carregar agendamentos", err);
            if (err.response?.status === 401) {
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
                carregarAgendamentos();
            } catch (err) { 
                alert("Erro ao cancelar o agendamento."); 
            }
        }
    };

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                            Meus Agendamentos
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                            Gerencie suas consultas marcadas e seu histórico.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Tooltip title="Atualizar Lista" arrow>
                            <IconButton 
                                onClick={carregarAgendamentos} 
                                icon={<RefreshCw color='#32B5FE' />} 
                                sx={{ 
                                    bgcolor: 'white', 
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#32B5FE', color: '#32B5FE', transform: 'rotate(15deg)' }
                                }}
                            >
                                <RefreshCw size={20} color={loading ? "#cbd5e1" : "inherit"} />
                            </IconButton>
                        </Tooltip>
                        <Chip 
                            icon={<CheckCircle2 size={16} color="#10B981" />} 
                            label={`${agendamentos.length} Consultas`} 
                            sx={{ 
                                fontWeight: 800, 
                                bgcolor: '#ECFDF5', 
                                color: '#10B981', 
                                border: '1px solid #A7F3D0',
                                px: 1, height: 36, borderRadius: '12px'
                            }} 
                        />
                    </Box>
                </Box>

                {/* CONTEÚDO */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 2 }}>
                        <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Carregando sua agenda...</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {agendamentos.length > 0 ? agendamentos.map((ag) => (
                            <Grid item xs={12} md={6} lg={4} key={ag.id}>
                                <Paper elevation={0} sx={{ 
                                    p: 3.5, 
                                    borderRadius: '24px', 
                                    border: '1px solid #F1F5F9', 
                                    bgcolor: '#ffffff', 
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                    '&:hover': { 
                                        boxShadow: '0 15px 35px -10px rgba(50, 181, 254, 0.15)', 
                                        borderColor: '#32B5FE',
                                        transform: 'translateY(-4px)' 
                                    } 
                                }}>
                                    {/* STATUS E AÇÕES */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                                        <Chip 
                                            label={ag.status ? ag.status.toUpperCase() : 'CONFIRMADO'} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 800, fontSize: '0.7rem', height: 26, px: 1, borderRadius: '8px', letterSpacing: '0.5px',
                                                bgcolor: (!ag.status || ag.status === 'confirmado') ? '#ECFDF5' : '#FEFCE8',
                                                color: (!ag.status || ag.status === 'confirmado') ? '#10B981' : '#EAB308',
                                                border: '1px solid',
                                                borderColor: (!ag.status || ag.status === 'confirmado') ? '#A7F3D0' : '#FEF08A'
                                            }} 
                                        />
                                        <Tooltip title="Cancelar Consulta" arrow>
                                            <IconButton 
                                                onClick={() => cancelarAgendamento(ag.id)} 
                                                size="small" 
                                                sx={{ 
                                                    color: '#CBD5E1', 
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444', transform: 'scale(1.1)' } 
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* INFO DO MÉDICO */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                                        <Avatar sx={{ 
                                            bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 800, width: 56, height: 56, 
                                            border: '1px solid #E2E8F0', fontSize: '1.2rem' 
                                        }}>
                                            {ag.nome_medico ? ag.nome_medico[0].toUpperCase() : 'M'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                                {ag.nome_medico}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#32B5FE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {ag.especialidade}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 3, borderStyle: 'dashed', borderColor: '#E2E8F0' }} />

                                    {/* DETALHES DO AGENDAMENTO */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', p: 1, borderRadius: '10px', display: 'flex' }}>
                                                <Calendar size={16} color="#32B5FE" />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                                                {ag.data_agendamento}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', p: 1, borderRadius: '10px', display: 'flex' }}>
                                                <Clock size={16} color="#32B5FE" />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                                                {ag.horario}h
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', p: 1, borderRadius: '10px', display: 'flex' }}>
                                                <MapPin size={16} color="#32B5FE" />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ag.nome_clinica}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        )) : (
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: 0.6 }}>
                                <AlertCircle size={70} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '20px' }} />
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#64748B', mb: 1 }}>Nenhuma consulta encontrada.</Typography>
                                <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 500 }}>Suas marcações aparecerão aqui.</Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Box>
        </Fade>
    );
};

export default MeusAgendamentos;