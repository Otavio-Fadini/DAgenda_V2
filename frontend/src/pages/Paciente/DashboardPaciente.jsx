import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, 
    ListItemText, Avatar, Chip, Skeleton, IconButton, Tooltip, Button, Fade 
} from '@mui/material';
import { 
    Calendar, Clock, User, Trash2, 
    Activity, CreditCard, ClipboardList, HeadphonesIcon 
} from 'lucide-react';
import axios from 'axios';

const DashboardPaciente = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalDebito, setTotalDebito] = useState(0);
    const fetchConsultas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://dagenda.com.br/api/paciente/meus-agendamentos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsultas(response.data);
        } catch (err) {
            console.error("Erro ao carregar dados", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDebitos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://dagenda.com.br/api/paciente/dashboard/total-pendente', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTotalDebito(response.data.totalPendente);
        } catch (err) {
            console.error("Erro ao buscar débitos", err);
        }
    };

    useEffect(() => { fetchConsultas(); fetchDebitos(); }, []);

    const handleCancelar = async (id) => {
        if (window.confirm("Deseja realmente cancelar esta consulta?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://dagenda.com.br/api/agendamentos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConsultas(consultas.filter(c => c.id !== id));
            } catch (err) { alert("Erro ao cancelar."); }
        }
    };

    // Componente de Estatística Premium
    const StatCard = ({ icon: Icon, title, value, color }) => (
        <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2.5, 
            border: '1px solid #F1F5F9', 
            bgcolor: '#ffffff', 
            flex: 1,
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)',
                borderColor: color === 'primary' ? '#32B5FE' : '#F1F5F9'
            }
        }}>
            <Box sx={{ 
                p: 2, 
                borderRadius: '16px', 
                bgcolor: color === 'primary' ? 'rgba(50, 181, 254, 0.1)' : color === 'success' ? '#ECFDF5' : '#FEF2F2', 
                color: color === 'primary' ? '#32B5FE' : color === 'success' ? '#10B981' : '#EF4444', 
                display: 'flex' 
            }}>
                <Icon size={28} strokeWidth={2.5} />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2, mt: 0.5 }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );

    const proximaConsulta = consultas.length > 0 ? consultas[0] : null;

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ 
                width: '100%', 
                height: '100%', 
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                bgcolor: '#F8FAFC'
            }}>
                {/* CABEÇALHO */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                            Painel do Paciente
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                            Bem-vindo(a) ao DAGENDA, <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{localStorage.getItem('userName')}</Box>.
                        </Typography>
                    </Box>
                    <Chip 
                        label="SISTEMA ONLINE" 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: '#ECFDF5', 
                            color: '#10B981', 
                            border: '1px solid #A7F3D0',
                            px: 1, height: 32, borderRadius: '8px'
                        }} 
                    />
                </Box>

                {/* INDICADORES */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, width: '100%', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                    <StatCard icon={Calendar} title="Consultas Ativas" value={consultas.length} color="primary" />
                    <StatCard icon={ClipboardList} title="Histórico Total" value={consultas.length} color="success" />
                    <StatCard icon={CreditCard} title="Débitos Pendentes" value={totalDebito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="error" />
                </Box>

                {/* CONTEÚDO PRINCIPAL */}
                <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, minHeight: 0, width: '100%', flexDirection: { xs: 'column', lg: 'row' } }}>
                    
                    {/* LISTA DE AGENDAMENTOS */}
                    <Paper elevation={0} sx={{ 
                        flex: { xs: 'none', lg: 3 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: '24px', 
                        border: '1px solid #F1F5F9',
                        bgcolor: 'white',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
                    }}>
                        <Box sx={{ p: 3.5, borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>Agenda de Consultas</Typography>
                            <Chip label={`${consultas.length} registros`} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '16px' }} />)}
                                </Box>
                            ) : consultas.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {consultas.map((c) => (
                                        <ListItem 
                                            key={c.id} 
                                            sx={{ 
                                                mb: 2, 
                                                border: '1px solid #F1F5F9', 
                                                borderRadius: '16px', 
                                                p: 3,
                                                bgcolor: '#ffffff',
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    boxShadow: '0 12px 24px -10px rgba(50, 181, 254, 0.15)', 
                                                    borderColor: '#32B5FE', 
                                                    transform: 'translateY(-2px)' 
                                                }
                                            }}
                                        >
                                            <Avatar sx={{ mr: 3, bgcolor: '#F8FAFC', color: '#64748B', width: 56, height: 56, border: '1px solid #E2E8F0' }}>
                                                <User size={28} />
                                            </Avatar>
                                            
                                            <ListItemText 
                                                primary={<Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{c.nome_medico}</Typography>}
                                                secondary={
                                                    <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 600, mt: 0.5, display: 'flex', alignItems: 'center' }}>
                                                        {c.especialidade} <Box component="span" sx={{ color: '#CBD5E1', mx: 1.5 }}>•</Box> {c.nome_clinica}
                                                    </Typography>
                                                }
                                            />

                                            <Box sx={{ textAlign: 'right', mr: 4 }}>
                                                <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{c.data_agendamento}</Typography>
                                                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{c.horario}</Typography>
                                            </Box>

                                            <Chip 
                                                label={c.status.toUpperCase()} 
                                                sx={{ 
                                                    fontWeight: 800, fontSize: '0.75rem', height: 28, px: 1, borderRadius: '8px',
                                                    bgcolor: c.status === 'confirmado' ? '#ECFDF5' : '#FEFCE8',
                                                    color: c.status === 'confirmado' ? '#10B981' : '#EAB308',
                                                    border: '1px solid',
                                                    borderColor: c.status === 'confirmado' ? '#A7F3D0' : '#FEF08A'
                                                }} 
                                            />

                                            <Tooltip title="Desmarcar Consulta" arrow>
                                                <IconButton 
                                                    onClick={() => handleCancelar(c.id)} 
                                                    sx={{ 
                                                        ml: 3, color: '#CBD5E1', 
                                                        transition: 'all 0.2s',
                                                        '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2', transform: 'scale(1.1)' } 
                                                    }}
                                                >
                                                    <Trash2 size={20} />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
                                    <Activity size={70} color="#CBD5E1" />
                                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 700, color: '#64748B' }}>Sua agenda está livre!</Typography>
                                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>Nenhum compromisso futuro encontrado.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {/* COLUNA DIREITA */}
                    <Box sx={{ flex: { xs: 'none', lg: 1 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* PRÓXIMO ATENDIMENTO */}
                        <Paper elevation={0} sx={{ 
                            p: 3.5, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#32B5FE', textTransform: 'uppercase', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Clock size={18} /> Próximo Atendimento
                            </Typography>
                            {proximaConsulta ? (
                                <Box>
                                    <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', mb: 3, border: '1px solid #F1F5F9' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>{proximaConsulta.nome_medico}</Typography>
                                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{proximaConsulta.especialidade}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px dashed #E2E8F0' }}>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>DATA</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>{proximaConsulta.data_agendamento}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>HORÁRIO</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>{proximaConsulta.horario}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ py: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Nenhum compromisso agendado.</Typography>
                                </Box>
                            )}
                        </Paper>

                       {/* SUPORTE PREMIUM */}
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: '24px', 
                            bgcolor: '#0F172A', 
                            color: 'white', 
                            flexGrow: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', /* ALTERADO AQUI: De space-between para center */
                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Efeito de brilho no fundo */}
                            <Box sx={{ 
                                position: 'absolute', top: -50, right: -50, width: 150, height: 150, 
                                background: 'radial-gradient(circle, rgba(50, 181, 254, 0.2) 0%, rgba(0,0,0,0) 70%)',
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.5px', color: 'white' }}>Central de Ajuda</Typography>
                                <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    Precisa de assistência com seus agendamentos ou pagamentos?
                                </Typography>
                            </Box>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                startIcon={<HeadphonesIcon size={20} />}
                                sx={{ 
                                    mt: 4,
                                    bgcolor: '#32B5FE', 
                                    borderRadius: '12px', 
                                    fontWeight: 800, 
                                    py: 1.8,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    position: 'relative',
                                    zIndex: 1,
                                    boxShadow: '0 8px 16px -4px rgba(50, 181, 254, 0.4)',
                                    transition: 'all 0.3s ease',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#29A3E5', transform: 'translateY(-2px)', boxShadow: '0 12px 20px -4px rgba(50, 181, 254, 0.5)' }
                                }}
                            >
                                Falar com Suporte
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default DashboardPaciente;