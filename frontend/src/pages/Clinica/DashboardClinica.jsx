import React from 'react';
import { Box, Typography, Grid, Paper, Chip, Avatar, Button, LinearProgress, Divider } from '@mui/material';
import { Users, Calendar, Activity, Clock, ChevronRight } from 'lucide-react';

const DashboardClinica = () => {
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%' }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-1.5px' }}>Painel da Unidade</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 4 }}>Monitoramento em tempo real da operação clínica.</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: 'Pacientes Hoje', val: '42', icon: <Users color="#32B5FE"/>, color: '#32B5FE' },
                    { label: 'Médicos Ativos', val: '08', icon: <Activity color="#10b981"/>, color: '#10b981' },
                    { label: 'Taxa de Ocupação', val: '85%', icon: <Calendar color="#f59e0b"/>, color: '#f59e0b' },
                ].map((kpi, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: `${kpi.color}15`, borderRadius: 3 }}>{kpi.icon}</Box>
                                <Typography variant="h5" fontWeight={900}>{kpi.val}</Typography>
                            </Box>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">{kpi.label}</Typography>
                            <LinearProgress variant="determinate" value={70} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: kpi.color } }} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h6" fontWeight={900} sx={{ mb: 2, color: '#0f172a' }}>Fluxo de Atendimento (Próximas 2h)</Typography>
            <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                {[1, 2, 3].map((_, i) => (
                    <Box key={i} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i !== 2 ? '1px solid #f1f5f9' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Typography variant="h6" fontWeight={900} color="#32B5FE">14:30</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={800}>Paciente: Roberto Silva</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>Médico: Dr. Otávio Fadini • Oftalmologia</Typography>
                            </Box>
                        </Box>
                        <Chip label="Em Espera" sx={{ fontWeight: 900, bgcolor: '#fef3c7', color: '#92400e', borderRadius: 2 }} />
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default DashboardClinica;