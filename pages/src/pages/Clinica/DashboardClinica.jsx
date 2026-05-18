import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, LinearProgress, List, ListItem, ListItemText } from '@mui/material';
import { Building2, Users, DollarSign, BarChart3 } from 'lucide-react';
import axios from 'axios';

const DashboardClinica = () => {
    return (
        <Box sx={{ width: '100%', height: '100%', p: 4, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight={900}>Gestão da Clínica</Typography>
                <Chip label="ADMINISTRATIVO" sx={{ fontWeight: 900, bgcolor: '#1e293b', color: 'white' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                <StatCard icon={Users} title="Total de Médicos" value="12" color="primary" />
                <StatCard icon={Building2} title="Salas Ativas" value="08" color="secondary" />
                <StatCard icon={DollarSign} title="Faturamento Mês" value="R$ 42.500" color="success" />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, minHeight: 0 }}>
                {/* GRÁFICO OU LISTA DE PROFISSIONAIS ATIVOS */}
                <Paper sx={{ width: '65%', p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Ocupação das Salas</Typography>
                    {[1, 2, 3, 4].map((item) => (
                        <Box key={item} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight={700}>Consultório {item}</Typography>
                                <Typography variant="caption" color="text.secondary">80% ocupado</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={80} sx={{ height: 8, borderRadius: 5 }} />
                        </Box>
                    ))}
                </Paper>

                {/* ÚLTIMOS AGENDAMENTOS DA CLÍNICA */}
                <Paper sx={{ width: '35%', display: 'flex', flexDirection: 'column', borderRadius: 5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" fontWeight={800}>Últimos Movimentos</Typography>
                    </Box>
                    <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {[1, 2, 3, 5].map((i) => (
                            <ListItem key={i} divider>
                                <ListItemText 
                                    primary={<Typography variant="caption" fontWeight={800}>Novo Agendamento</Typography>}
                                    secondary="Dr. Otávio - 14:30h"
                                />
                                <Typography variant="caption" color="success.main" fontWeight={800}>+ R$ 250</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

// Componente StatCard interno para simplicidade
const StatCard = ({ icon: Icon, title, value, color }) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2.5, border: '1px solid #e2e8f0', flex: 1 }}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}><Icon size={22} /></Box>
        <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>{title}</Typography>
            <Typography variant="h5" fontWeight={800}>{value}</Typography>
        </Box>
    </Paper>
);

export default DashboardClinica;