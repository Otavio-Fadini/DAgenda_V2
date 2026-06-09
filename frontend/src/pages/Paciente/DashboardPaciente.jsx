import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, 
    ListItemText, Avatar, Chip, Skeleton, Fade, Button 
} from '@mui/material';
import { 
    Calendar, User, 
    Activity, CreditCard, ClipboardList, HeadphonesIcon, Clock, MapPin, Stethoscope 
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

    // Função de Cores Padronizada do DAGENDA
    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'agendado' || s === 'confirmado') return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
        if (s === 'pendente pagamento' || s === 'pendente') return { bg: '#FEFCE8', color: '#EAB308', border: '#FEF08A' };
        if (s === 'concluido' || s === 'finalizado') return { bg: '#F0F9FF', color: '#32B5FE', border: '#BAE6FD' };
        if (s === 'cancelado') return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' };
        return { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' }; 
    };

    // Filtro inteligente para remover consultas que já passaram da data/hora atual
    const isConsultaValida = (dataStr, horaStr) => {
        if (!dataStr) return false;
        try {
            let ano, mes, dia;
            if (dataStr.includes('/')) {
                [dia, mes, ano] = dataStr.split('/');
            } else {
                [ano, mes, dia] = dataStr.split('-');
            }
            const [hora, min] = (horaStr || '23:59').split(':');
            const dataConsulta = new Date(ano, mes - 1, dia, hora, min);
            const agora = new Date();
            
            return dataConsulta >= agora; // Só retorna TRUE se a consulta for no futuro ou agora
        } catch (e) {
            return true;
        }
    };

    // Lista de consultas filtradas (sem canceladas e sem as que já passaram)
    const consultasAtivas = consultas.filter(c => 
        c.status !== 'Cancelado' && isConsultaValida(c.data_agendamento, c.horario)
    );

    // Componente de Estatística Premium
    const StatCard = ({ icon: Icon, title, value, color }) => (
        <Paper elevation={0} sx={{ 
            p: { xs: 2.2, sm: 3 }, 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2.5 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            border: '1px solid #F1F5F9', 
            bgcolor: '#ffffff', 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: 1 },
            minWidth: { xs: 0, sm: 240 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
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
                <Icon size={32} strokeWidth={2.5} />
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

    const proximaConsulta = [...consultasAtivas]
        .sort((a, b) => {
            const dataA = new Date(a.data_agendamento.includes('/') ? a.data_agendamento.split('/').reverse().join('-') : a.data_agendamento + 'T' + a.horario);
            const dataB = new Date(b.data_agendamento.includes('/') ? b.data_agendamento.split('/').reverse().join('-') : b.data_agendamento + 'T' + b.horario);
            return dataA - dataB;
        })[0];

    return (
        <Fade in={true} timeout={600}>
            <Box className="responsive-page" sx={{ 
                width: '100%', 
                minHeight: { xs: '100dvh', md: '100%' }, 
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                bgcolor: '#F8FAFC'
            }}>
                {/* CABEÇALHO */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'center' }, textAlign: { xs: 'center', sm: 'left' }, gap: 2, mb: 4 }}>
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
                <Box className="paciente-stats" sx={{ display: 'flex', gap: { xs: 2, md: 3 }, mb: 4, width: '100%', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: { xs: 'nowrap', sm: 'wrap', lg: 'nowrap' } }}>
                    <StatCard icon={Calendar} title="Próximas Consultas" value={consultasAtivas.length} color="primary" />
                    <StatCard icon={ClipboardList} title="Histórico Total" value={consultas.length} color="success" />
                    <StatCard icon={CreditCard} title="Débitos Pendentes" value={Number(totalDebito || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="error" />
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
                            <Chip label={`${consultasAtivas.length} registros`} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }} />
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '16px' }} />)}
                                </Box>
                            ) : consultasAtivas.length > 0 ? (
                                <List sx={{ p: 0 }}>
                                    {consultasAtivas
                                        .sort((a, b) => {
                                            const dataA = new Date(a.data_agendamento.includes('/') ? a.data_agendamento.split('/').reverse().join('-') : a.data_agendamento + 'T' + a.horario);
                                            const dataB = new Date(b.data_agendamento.includes('/') ? b.data_agendamento.split('/').reverse().join('-') : b.data_agendamento + 'T' + b.horario);
                                            return dataA - dataB;
                                        })
                                        .map((c) => {
                                            const statusStyle = getStatusStyle(c.status);
                                            const nomeMedico = c.nome_medico || 'Médico N/I';
                                            
                                            return (
                                            <ListItem 
                                                key={c.id} 
                                                sx={{ 
                                                    mb: 2, 
                                                    border: '1px solid #F1F5F9', 
                                                    borderRadius: '16px', 
                                                    p: { xs: 2.5, md: 3.5 },
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', md: 'row' },
                                                    alignItems: { xs: 'flex-start', md: 'center' },
                                                    gap: { xs: 2, md: 0 },
                                                    bgcolor: '#ffffff',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { 
                                                        boxShadow: '0 12px 24px -10px rgba(50, 181, 254, 0.15)', 
                                                        borderColor: '#32B5FE', 
                                                        transform: 'translateY(-2px)' 
                                                    }
                                                }}
                                            >
                                                {/* BLOCO ESQUERDO: Avatar + Info Médico */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                                                    <Avatar 
                                                        src={c.foto_medico} // Tenta carregar a imagem do médico
                                                        sx={{ width: 64, height: 64, bgcolor: '#0F172A', color: '#FFF', fontWeight: 900, border: '2px solid #F1F5F9', fontSize: '1.2rem' }}
                                                    >
                                                        {!c.foto_medico && nomeMedico[0].toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A', mb: 0.5 }}>
                                                            {nomeMedico}
                                                        </Typography>
                                                        
                                                        {/* Especialidade e CRM */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 700 }}>
                                                                {c.especialidade}
                                                            </Typography>
                                                            {c.crm_medico && (
                                                                <>
                                                                    <Box component="span" sx={{ color: '#CBD5E1' }}>•</Box>
                                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 600 }}>
                                                                        <Stethoscope size={12} /> CRM: {c.crm_medico}
                                                                    </Typography>
                                                                </>
                                                            )}
                                                        </Box>
                                                        
                                                        {/* Clínica (só mostra se o nome da clínica existir) */}
                                                        {c.nome_clinica && (
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 600 }}>
                                                                <MapPin size={12} /> {c.nome_clinica}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* BLOCO DIREITO: Data, Hora e Status */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                                                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                        <Typography sx={{ fontWeight: 900, color: '#0F172A' }}>{c.data_agendamento}</Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 0.5 }}>
                                                            <Clock size={12} /> {c.horario}
                                                        </Typography>
                                                    </Box>

                                                    <Chip 
                                                        label={c.status.toUpperCase()} 
                                                        sx={{ 
                                                            fontWeight: 800, fontSize: '0.75rem', height: 28, px: 1, borderRadius: '8px',
                                                            bgcolor: statusStyle.bg,
                                                            color: statusStyle.color,
                                                            border: '1px solid',
                                                            borderColor: statusStyle.border
                                                        }} 
                                                    />
                                                </Box>
                                            </ListItem>
                                        )})}
                                </List>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
                                    <Activity size={70} color="#CBD5E1" />
                                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 700, color: '#64748B' }}>Sua agenda está livre!</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: '#94A3B8' }}>Você não tem consultas futuras marcadas.</Typography>
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
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Nenhum compromisso futuro agendado.</Typography>
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
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
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