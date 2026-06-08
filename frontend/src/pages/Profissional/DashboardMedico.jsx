import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Chip, Fade, CircularProgress, Tooltip } from '@mui/material';
import { Calendar, Users, TrendingUp, ChevronRight, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DashboardProfissional = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState({
        kpis: { consultasHoje: 0, totalPacientes: 0, faturamentoDia: 0 },
        proximasConsultas: []
    });
    const [horaAtual, setHoraAtual] = useState(new Date());

    // Novos estados para o Token
    const [openTokenModal, setOpenTokenModal] = useState(false);
    const [codigoDigitado, setCodigoDigitado] = useState('');
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setHoraAtual(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const carregarDashboard = async () => {
            try {
                const response = await api.get('/profissional/dashboard');
                if (response.data) {
                    setDados(response.data);
                }
            } catch (error) {
                console.error("Erro ao carregar o dashboard do profissional:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarDashboard();
    }, []);

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'agendado' || s === 'confirmado') return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
        if (s === 'pendente pagamento' || s === 'pendente') return { bg: '#FEFCE8', color: '#EAB308', border: '#FEF08A' };
        if (s === 'concluido' || s === 'finalizado') return { bg: '#F0F9FF', color: '#32B5FE', border: '#BAE6FD' };
        if (s === 'cancelado') return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' };
        return { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' }; 
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Carregando métricas...</Typography>
            </Box>
        );
    }

    

    const iniciarProcessoAtendimento = (c) => {
        setConsultaSelecionada(c);
        // Chama a API que envia o token ao paciente
        api.post('/profissional/enviar-token', { agendamento_id: c.id });
        setOpenTokenModal(true);
    };

    const validarEIniciar = async () => {
        try {
            await api.post('/profissional/verificar-token', { 
                agendamento_id: consultaSelecionada.id, 
                codigo: codigoDigitado 
            });
            setOpenTokenModal(false);
            navigate('/dashboard/atendimento', { state: consultaSelecionada });
        } catch (e) {
            alert("Código inválido ou expirado!");
        }
    };

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                            Painel do Médico
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                            Visão geral da sua agenda e fluxo de faturamento.
                        </Typography>
                    </Box>
                    <Chip 
                        label="SISTEMA OPERANTE" 
                        sx={{ 
                            fontWeight: 800, bgcolor: '#ECFDF5', color: '#10B981', 
                            border: '1px solid #A7F3D0', px: 1, height: 32, borderRadius: '8px'
                        }} 
                    />
                </Box>
                
                {/* KPIS PRINCIPAIS */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {[
                        { label: 'Consultas Hoje', val: dados.kpis.consultasHoje, icon: <Calendar color="#32B5FE" size={28} strokeWidth={2.5}/>, color: '#32B5FE', bg: 'rgba(50, 181, 254, 0.1)' },
                        { label: 'Total de Pacientes', val: dados.kpis.totalPacientes, icon: <Users color="#F97316" size={28} strokeWidth={2.5}/>, color: '#F97316', bg: '#FFF7ED' },
                        { label: 'Faturamento do Dia', val: `R$ ${Number(dados.kpis.faturamentoDia || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, icon: <TrendingUp color="#10B981" size={28} strokeWidth={2.5}/>, color: '#10B981', bg: '#ECFDF5' },
                    ].map((kpi, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Paper elevation={0} sx={{ 
                                p: 3.5, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white',
                                display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)', borderColor: kpi.color }
                            }}>
                                <Box sx={{ p: 2.5, bgcolor: kpi.bg, borderRadius: '20px' }}>{kpi.icon}</Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {kpi.label}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', mt: 0.5, letterSpacing: '-0.5px' }}>
                                        {kpi.val}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* LISTA DE PACIENTES */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#0F172A' }}>
                        Próximos Atendimentos
                    </Typography>
                    <Button 
                        endIcon={<ChevronRight size={16} />} 
                        onClick={() => navigate('/dashboard/agenda-medica')} 
                        sx={{ fontWeight: 800, bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' }, textTransform: 'none' }}
                    >
                        Ver todos
                    </Button>
                </Box>
                
                <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', bgcolor: 'white', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)' }}>
                    {dados.proximasConsultas && dados.proximasConsultas.length > 0 ? dados.proximasConsultas.map((c, index) => {
                        const style = getStatusStyle(c.status);
                        
                        return (
                            <Box key={c.id} sx={{ 
                                p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                                alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: { xs: 3, md: 0 },
                                borderBottom: index !== dados.proximasConsultas.length - 1 ? '1px solid #F8FAFC' : 'none', 
                                transition: 'all 0.2s', '&:hover': { bgcolor: '#F8FAFC' } 
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar src={c.foto_perfil} sx={{ width: 56, height: 56, bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 900, border: '2px solid #E2E8F0', fontSize: '1.2rem' }}>
                                        {c.paciente ? c.paciente[0].toUpperCase() : 'P'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={900} color="#0F172A" sx={{ mb: 0.5 }}>
                                            {c.paciente || 'Paciente N/I'}
                                        </Typography>
                                        <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.5px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: '6px', color: '#0F172A' }}>
                                                <Clock size={12}/> {c.horario || c.hora}
                                            </Box>
                                            <Box component="span" sx={{ color: '#CBD5E1' }}>•</Box> 
                                            {c.data_agendamento || c.data}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                                    <Chip 
                                        label={(c.status || 'Pendente').toUpperCase()} 
                                        size="small" 
                                        sx={{ fontWeight: 800, fontSize: '0.7rem', height: 28, px: 1, borderRadius: '8px', letterSpacing: '0.5px', bgcolor: style.bg, color: style.color, border: '1px solid', borderColor: style.border }} 
                                    />
                                    
                                    {c.status === 'Pendente pagamento' || c.status === 'Pendente' ? (
                                        <Typography variant="body2" color="#94A3B8" fontWeight={700} sx={{ textAlign: 'center', minWidth: 120 }}>
                                            Aguardando pagamento
                                        </Typography>
                                    ) : c.status === 'Cancelado' ? (
                                        <Typography variant="body2" color="#EF4444" fontWeight={700} sx={{ textAlign: 'center', minWidth: 120 }}>
                                            Consulta Cancelada
                                        </Typography>
                                    ) : c.status === 'Concluido' || c.status === 'Finalizado' ? (
                                        <Button 
                                            variant="contained" size="small" endIcon={<ChevronRight size={16}/>} 
                                            onClick={() => navigate('/dashboard/atendimento', { state: c })} 
                                            sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '10px', bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' }, py: 1, px: 2, boxShadow: 'none', minWidth: 120 }}
                                        >
                                            Ver Resumo
                                        </Button>
                                    ) : (
                                        (() => {
                                            const dataStr = c.data_agendamento || c.data;
                                            const horaStr = c.horario || c.hora;
                                            let atendimentoLiberado = true;

                                            if (dataStr && horaStr) {
                                                try {
                                                    const [dia, mes, ano] = dataStr.split('/');
                                                    const [hora, min] = horaStr.split(':');
                                                    const dataAgendamento = new Date(ano, mes - 1, dia, hora, min);
                                                    const diffEmMinutos = (dataAgendamento - horaAtual) / (1000 * 60);
                                                    
                                                    atendimentoLiberado = diffEmMinutos <= 15;
                                                } catch (e) {
                                                    atendimentoLiberado = true; 
                                                }
                                            }

                                            if (!atendimentoLiberado) {
                                                return (
                                                    <Tooltip title="O atendimento é liberado 15 minutos antes do horário marcado." arrow>
                                                        <span>
                                                            <Button 
                                                                disabled
                                                                variant="contained" size="small" startIcon={<Clock size={16} />}
                                                                sx={{ bgcolor: '#F1F5F9 !important', color: '#94A3B8 !important', borderRadius: '10px', py: 1, px: 2, fontWeight: 800, textTransform: 'none', boxShadow: 'none', minWidth: 120 }}
                                                            >
                                                                Aguarde
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                );
                                            }

                                            return (
                                                <Button 
                                                    variant="contained" size="small" endIcon={<ChevronRight size={16}/>} 
                                                    onClick={() => iniciarProcessoAtendimento(c)} // <-- Chamada do novo processo
                                                    sx={{ fontWeight: 800, textTransform: 'none', borderRadius: '10px', bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' }, py: 1, px: 2, boxShadow: 'none', minWidth: 120 }}
                                                >
                                                    Atender
                                                </Button>
                                            );
                                        })()
                                    )}
                                </Box>
                            </Box>
                        );
                    }) : (
                        <Box sx={{ p: 6, textAlign: 'center', opacity: 0.6 }}>
                            <Activity size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" fontWeight={800} color="#64748B">Sua agenda está livre</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>Você não possui consultas nas próximas horas.</Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
            <Dialog open={openTokenModal} onClose={() => setOpenTokenModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 900 }}>Validar Atendimento</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#64748B' }}>
                        Um código de segurança foi enviado para o celular do paciente. Digite abaixo para iniciar:
                    </Typography>
                    <TextField 
                        autoFocus 
                        fullWidth 
                        value={codigoDigitado} 
                        onChange={(e) => setCodigoDigitado(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        inputProps={{ style: { fontSize: '2rem', textAlign: 'center', letterSpacing: '10px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenTokenModal(false)} sx={{ color: '#64748B' }}>Cancelar</Button>
                    <Button onClick={validarEIniciar} variant="contained" sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' } }}>Validar e Iniciar</Button>
                </DialogActions>
            </Dialog>
        </Fade>
    );
};

export default DashboardProfissional;