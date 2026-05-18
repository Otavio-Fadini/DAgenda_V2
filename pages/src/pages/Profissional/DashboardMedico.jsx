import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Avatar, Chip, Button, Skeleton, Divider } from '@mui/material';
import { Calendar, Clock, User, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const DashboardMedico = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgenda = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3001/api/agendamentos/agenda-profissional', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAgenda(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchAgenda();
    }, []);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #e2e8f0', flex: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}>
                <Icon size={24} />
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{title}</Typography>
                <Typography variant="h5" fontWeight={800} color="#1e293b">{value}</Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ width: '100%', height: '100%', p: 4, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight={900}>Agenda Médica</Typography>
                <Chip label="MODO ATENDIMENTO" color="secondary" sx={{ fontWeight: 900 }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                <StatCard icon={User} title="Pacientes Hoje" value={agenda.length} color="primary" />
                <StatCard icon={CheckCircle} title="Concluídos" value="0" color="success" />
                <StatCard icon={TrendingUp} title="Produtividade" value="100%" color="secondary" />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, minHeight: 0 }}>
                <Paper sx={{ width: '75%', display: 'flex', flexDirection: 'column', borderRadius: 5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
                        <Typography variant="h6" fontWeight={800}>Pacientes Aguardando</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {loading ? <Skeleton variant="rectangular" height="100%" /> : (
                            <List>
                                {agenda.map((paciente) => (
                                    <ListItem key={paciente.id} sx={{ mb: 2, border: '1px solid #f1f5f9', borderRadius: 4, p: 2 }}>
                                        <Avatar sx={{ mr: 2, bgcolor: '#6366f1' }}>{paciente.nome_paciente[0]}</Avatar>
                                        <ListItemText 
                                            primary={<Typography fontWeight={800}>{paciente.nome_paciente}</Typography>}
                                            secondary={`Convênio: ${paciente.convenio || 'Particular'}`}
                                        />
                                        <Box sx={{ textAlign: 'right', mr: 3 }}>
                                            <Typography fontWeight={800} display="flex" alignItems="center" gap={1}><Clock size={16}/> {paciente.horario}</Typography>
                                        </Box>
                                        <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>Chamar</Button>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Paper>

                <Box sx={{ width: '25%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 5, bgcolor: '#0f172a', color: 'white', flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Resumo do Dia</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>Você tem {agenda.length} atendimentos programados para hoje.</Typography>
                        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AlertCircle color="#fbbf24" />
                            <Typography variant="caption">1 Paciente com atraso</Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardMedico;