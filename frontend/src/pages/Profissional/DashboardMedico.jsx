import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Chip } from '@mui/material';
import { Calendar, Users, DollarSign, Clock, ChevronRight } from 'lucide-react';

const DashboardMedico = () => {
    const proximasConsultas = [
        { id: 1, paciente: 'Otávio Augusto', horario: '14:00', tipo: 'Retorno', status: 'Confirmado' },
        { id: 2, paciente: 'Ana Souza', horario: '15:30', tipo: 'Primeira Consulta', status: 'Pendente' },
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Painel Médico</Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: 'Consultas Hoje', val: '8', icon: <Calendar color="#32B5FE"/> },
                    { label: 'Novos Pacientes', val: '12', icon: <Users color="#32B5FE"/> },
                    { label: 'Faturamento Mês', val: 'R$ 4.200', icon: <DollarSign color="#10b981"/> },
                ].map((kpi, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 4 }}>{kpi.icon}</Box>
                            <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">{kpi.label}</Typography>
                                <Typography variant="h5" fontWeight={900}>{kpi.val}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Próximos Atendimentos</Typography>
            <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {proximasConsultas.map((c, index) => (
                    <Box key={c.id} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: index !== proximasConsultas.length - 1 ? '1px solid #f1f5f9' : 'none', '&:hover': { bgcolor: '#fcfcfd' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#32B5FE', fontWeight: 800 }}>{c.paciente[0]}</Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={800}>{c.paciente}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clock size={12}/> {c.horario} - {c.tipo}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip label={c.status} size="small" sx={{ fontWeight: 800, bgcolor: c.status === 'Confirmado' ? '#dcfce7' : '#fef3c7' }} />
                            <Button size="small" endIcon={<ChevronRight size={16}/>} sx={{ fontWeight: 700, textTransform: 'none' }}>Ver Prontuário</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default DashboardMedico;