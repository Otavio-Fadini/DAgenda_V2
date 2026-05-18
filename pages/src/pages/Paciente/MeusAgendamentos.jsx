import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Avatar, Divider, IconButton, Tooltip } from '@mui/material';
import { Calendar, Clock, MapPin, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const MeusAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([]);

    const carregarAgendamentos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/api/agendamentos/meus-agendamentos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAgendamentos(res.data);
        } catch (err) { console.error("Erro ao carregar agendamentos", err); }
    };

    useEffect(() => { carregarAgendamentos(); }, []);

    const cancelarAgendamento = async (id) => {
        if (window.confirm("Deseja realmente cancelar este agendamento?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3001/api/agendamentos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                carregarAgendamentos();
            } catch (err) { alert("Erro ao cancelar."); }
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100%' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Meus Agendamentos</Typography>
                    <Typography variant="body1" color="text.secondary">Gerencie suas consultas marcadas e histórico.</Typography>
                </Box>
                <Chip icon={<CheckCircle2 size={16} />} label={`${agendamentos.length} Consultas`} sx={{ fontWeight: 700, bgcolor: '#32B5FE', color: 'white' }} />
            </Box>

            <Grid container spacing={3}>
                {agendamentos.length > 0 ? agendamentos.map((ag) => (
                    <Grid item xs={12} md={6} lg={4} key={ag.id}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', position: 'relative', transition: '0.3s', '&:hover': { boxShadow: '0 10px 20px rgba(0,0,0,0.05)' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Chip label={ag.status || 'Confirmado'} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }} />
                                <Tooltip title="Cancelar Agendamento">
                                    <IconButton onClick={() => cancelarAgendamento(ag.id)} size="small" sx={{ color: '#f87171', '&:hover': { bgcolor: '#fef2f2' } }}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: '#32B5FE', width: 50, height: 50 }}>{ag.nome_medico[0]}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={800}>{ag.nome_medico}</Typography>
                                    <Typography variant="caption" sx={{ color: '#32B5FE', fontWeight: 700 }}>{ag.especialidade}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                    <Calendar size={16} />
                                    <Typography variant="body2" fontWeight={600}>{ag.data_agendamento}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                    <Clock size={16} />
                                    <Typography variant="body2" fontWeight={600}>{ag.horario}h</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                    <MapPin size={16} />
                                    <Typography variant="body2" fontWeight={600} noWrap>{ag.nome_clinica}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                )) : (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
                        <AlertCircle size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <Typography variant="h6" color="text.secondary">Nenhuma consulta encontrada.</Typography>
                    </Box>
                )}
            </Grid>
        </Box>
    );
};

export default MeusAgendamentos;