import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, 
    ListItemText, Avatar, Chip, Skeleton, IconButton, Tooltip, Button 
} from '@mui/material';
import { 
    Calendar, Clock, User, Trash2, 
    Activity, CreditCard, ClipboardList, HeadphonesIcon 
} from 'lucide-react';
import axios from 'axios';

const DashboardPaciente = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConsultas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/agendamentos/meus-agendamentos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsultas(response.data);
        } catch (err) {
            console.error("Erro ao carregar dados", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConsultas(); }, []);

    const handleCancelar = async (id) => {
        if (window.confirm("Deseja realmente cancelar esta consulta?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3001/api/agendamentos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConsultas(consultas.filter(c => c.id !== id));
            } catch (err) { alert("Erro ao cancelar."); }
        }
    };

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 4, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2.5, 
            border: '1px solid #e2e8f0', 
            bgcolor: 'white', 
            flex: 1 
        }}>
            <Box sx={{ 
                p: 1.5, 
                borderRadius: 2.5, 
                bgcolor: color === 'primary' ? 'rgba(50, 181, 254, 0.1)' : 'success.light', 
                color: color === 'primary' ? '#32B5FE' : 'success.main', 
                display: 'flex' 
            }}>
                <Icon size={24} />
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );

    const proximaConsulta = consultas.length > 0 ? consultas[0] : null;

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            bgcolor: '#f8fafc'
        }}>
            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
                        Painel do Paciente
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Bem-vindo ao DAgenda, {localStorage.getItem('userName')}.
                    </Typography>
                </Box>
                <Chip label="SISTEMA OPERANTE" sx={{ fontWeight: 900, bgcolor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }} />
            </Box>

            {/* INDICADORES */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, width: '100%' }}>
                <StatCard icon={Calendar} title="Consultas Ativas" value={consultas.length} color="primary" />
                <StatCard icon={ClipboardList} title="Histórico Total" value={consultas.length} color="success" />
                <StatCard icon={CreditCard} title="Débitos" value="R$ 0,00" color="error" />
            </Box>

            {/* CONTEÚDO PRINCIPAL */}
            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, minHeight: 0, width: '100%' }}>
                
                {/* LISTA DE AGENDAMENTOS */}
                <Paper sx={{ 
                    width: '75%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 5, 
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)'
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>Agenda de Consultas</Typography>
                        <Chip label={`${consultas.length} registros`} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {loading ? (
                            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 3 }} />
                        ) : consultas.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {consultas.map((c) => (
                                    <ListItem 
                                        key={c.id} 
                                        sx={{ 
                                            mb: 2, 
                                            border: '1px solid #f1f5f9', 
                                            borderRadius: 4, 
                                            p: 2.5,
                                            transition: '0.2s',
                                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: '#32B5FE', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Avatar sx={{ mr: 2.5, bgcolor: '#f1f5f9', color: '#475569', width: 52, height: 52 }}>
                                            <User size={26} />
                                        </Avatar>
                                        
                                        <ListItemText 
                                            primary={<Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>{c.nome_medico}</Typography>}
                                            secondary={
                                                <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 600 }}>
                                                    {c.especialidade} <Box component="span" sx={{ color: '#cbd5e1', mx: 1 }}>•</Box> {c.nome_clinica}
                                                </Typography>
                                            }
                                        />

                                        <Box sx={{ textAlign: 'right', mr: 4 }}>
                                            <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{c.data_agendamento}</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>{c.horario}</Typography>
                                        </Box>

                                        <Chip 
                                            label={c.status.toUpperCase()} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 900, fontSize: '10px', height: 24, px: 1,
                                                bgcolor: c.status === 'confirmado' ? '#dcfce7' : '#fef9c3',
                                                color: c.status === 'confirmado' ? '#166534' : '#854d0e',
                                                border: '1px solid',
                                                borderColor: c.status === 'confirmado' ? '#bbf7d0' : '#fef08a'
                                            }} 
                                        />

                                        <Tooltip title="Desmarcar">
                                            <IconButton 
                                                onClick={() => handleCancelar(c.id)} 
                                                sx={{ ml: 2, color: '#cbd5e1', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                                <Activity size={60} color="#32B5FE" />
                                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>Nenhum agendamento futuro</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>

                {/* COLUNA DIREITA */}
                <Box sx={{ width: '25%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    {/* PRÓXIMO ATENDIMENTO */}
                    <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#32B5FE', textTransform: 'uppercase', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} /> Próximo Atendimento
                        </Typography>
                        {proximaConsulta ? (
                            <Box>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 4, mb: 2.5, border: '1px solid #f1f5f9' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{proximaConsulta.nome_medico}</Typography>
                                    <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 700 }}>{proximaConsulta.especialidade}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>DATA</Typography>
                                        <Typography variant="body2" fontWeight="800">{proximaConsulta.data_agendamento}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>HORÁRIO</Typography>
                                        <Typography variant="body2" fontWeight="800">{proximaConsulta.horario}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">Nenhum compromisso agendado.</Typography>
                        )}
                    </Paper>

                    {/* SUPORTE ESCURO COM AZUL */}
                    <Paper sx={{ 
                        p: 4, 
                        borderRadius: 5, 
                        bgcolor: '#0f172a', 
                        color: 'white', 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
                    }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Suporte Técnico</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.4 }}>Precisa de ajuda com o sistema ou agendamentos?</Typography>
                        </Box>
                        <Button 
                            fullWidth 
                            variant="contained" 
                            startIcon={<HeadphonesIcon size={18} />}
                            sx={{ 
                                bgcolor: '#32B5FE', 
                                borderRadius: 3, 
                                fontWeight: 800, 
                                py: 1.5,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#29a3e5' }
                            }}
                        >
                            Contatar Central
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardPaciente;