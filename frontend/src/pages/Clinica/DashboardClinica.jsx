import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Chip, Button, LinearProgress, Divider, Fade, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, TextField, Pagination } from '@mui/material';
import { Users, Calendar, Activity, Clock, ChevronRight, ChevronLeft, TrendingUp, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

const DashboardClinica = () => {
    // Estados para armazenar as informações reais do banco de dados
    const [stats, setStats] = useState({ total_medicos: 0, consultas_mes: 0 });
    const [lucroTotal, setLucroTotal] = useState(0);
    const [agendamentosHoje, setAgendamentosHoje] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados do Modal de Agenda
    const [modalOpen, setModalOpen] = useState(false);
    const [agendaCompleta, setAgendaCompleta] = useState([]);
    const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [loadingAgenda, setLoadingAgenda] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 6;

    const buscarAgendaCompleta = async (data) => {
        setLoadingAgenda(true);
        try {
            const response = await api.get('/clinica/agenda-completa', { params: { data } });
            setAgendaCompleta(response.data);
        } catch (e) { console.error("Erro agenda completa:", e); }
        finally { setLoadingAgenda(false); }
    };

    const alterarDia = (dias) => {
        const d = new Date(dataFiltro + 'T12:00:00');
        d.setDate(d.getDate() + dias);
        const novaData = d.toISOString().split('T')[0];
        setDataFiltro(novaData);
        setPaginaAtual(1);
        buscarAgendaCompleta(novaData);
    };

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            try {
                // Dispara as requisições simultaneamente para ficar mais rápido
                const [resStats, resFinanceiro] = await Promise.all([
                    api.get('/clinica/dashboard'),
                    api.get('/clinica/financeiro-geral')
                ]);

                // 1. Salva os dados básicos (total_medicos e consultas_mes)
                if (resStats.data) {
                    setStats(resStats.data);
                }

                // 2. Calcula o lucro total somando o "lucro_clinica" de todos os médicos
                if (resFinanceiro.data && resFinanceiro.data.length > 0) {
                    const lucroSomado = resFinanceiro.data.reduce((acc, curr) => acc + Number(curr.lucro_clinica || 0), 0);
                    setLucroTotal(lucroSomado);
                }

                // 3. Tenta buscar os agendamentos do dia (fluxo de atendimento)
                // Usando uma rota genérica, caso ela já exista no seu agendamentos.js
                try {
                    const resAgenda = await api.get('/agendamentos/clinica');
                    setAgendamentosHoje(resAgenda.data.slice(0, 5)); // Pega os 5 próximos
                } catch (e) {
                    console.log("Rota de fluxo diário não encontrada ou vazia.");
                    setAgendamentosHoje([]); 
                }

            } catch (error) {
                console.error("Erro ao carregar dados da clínica:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    // Tela de Carregamento Premium
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Sincronizando com a unidade...</Typography>
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
                            Painel da Unidade
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            Monitoramento em tempo real da operação clínica.
                        </Typography>
                    </Box>
                    <Chip 
                        label="OPERAÇÃO NORMAL" 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: '#ECFDF5', 
                            color: '#10B981', 
                            border: '1px solid #A7F3D0',
                            px: 1, height: 32, borderRadius: '8px'
                        }} 
                    />
                </Box>

                {/* KPIs PRINCIPAIS CONECTADOS AO BANCO */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {[
                        { 
                            label: 'Consultas no Mês', 
                            val: stats.consultas_mes || '0', 
                            icon: <Users color="#32B5FE" size={28} strokeWidth={2.5}/>, 
                            color: '#32B5FE', bg: 'rgba(50, 181, 254, 0.1)' 
                        },
                        { 
                            label: 'Médicos Vinculados', 
                            val: stats.total_medicos || '0', 
                            icon: <Activity color="#10B981" size={28} strokeWidth={2.5}/>, 
                            color: '#10B981', bg: '#ECFDF5' 
                        },
                        { 
                            label: 'Lucro Estimado', 
                            val: `R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                            icon: <TrendingUp color="#F59E0B" size={28} strokeWidth={2.5}/>, 
                            color: '#F59E0B', bg: '#FEFCE8' 
                        },
                    ].map((kpi, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Paper elevation={0} sx={{ 
                                p: 3.5, 
                                borderRadius: '24px', 
                                border: '1px solid #F1F5F9', 
                                bgcolor: '#ffffff',
                                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)',
                                    borderColor: kpi.color
                                }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
                                    <Box sx={{ p: 2, bgcolor: kpi.bg, borderRadius: '16px' }}>{kpi.icon}</Box>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>{kpi.val}</Typography>
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {kpi.label}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    // Cálculo visual: se for valor em R$, enche a barra em 100%. Se for número, usa o valor como porcentagem limite
                                    value={typeof kpi.val === 'string' && kpi.val.includes('R$') ? 100 : Math.min(parseInt(kpi.val) * 5, 100) || 0} 
                                    sx={{ 
                                        mt: 2, height: 8, borderRadius: '8px', bgcolor: '#F1F5F9', 
                                        '& .MuiLinearProgress-bar': { bgcolor: kpi.color, borderRadius: '8px' } 
                                    }} 
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* LISTA DE ATENDIMENTOS (FLUXO DIÁRIO) */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#0F172A' }}>
                        Fluxo de Atendimento (Próximas 2h)
                    </Typography>
                    <Button 
                        onClick={() => { setModalOpen(true); buscarAgendaCompleta(dataFiltro); }}
                        endIcon={<ChevronRight size={16} />} 
                        sx={{ fontWeight: 800, color: '#32B5FE', textTransform: 'none' }}
                    >
                        Ver agenda completa
                    </Button>
                </Box>
                
                <Paper elevation={0} sx={{ 
                    borderRadius: '24px', 
                    border: '1px solid #F1F5F9', 
                    overflow: 'hidden', 
                    bgcolor: 'white',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                }}>
                    {agendamentosHoje.length > 0 ? (
                        agendamentosHoje.map((item, i) => (
                            <Box key={i} sx={{ 
                                p: 3, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                borderBottom: i !== agendamentosHoje.length - 1 ? '1px solid #F8FAFC' : 'none',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#F8FAFC' }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                                        <Clock size={16} color="#64748B" style={{ marginBottom: '4px' }} />
                                        <Typography variant="h6" fontWeight={900} color="#0F172A">{item.horario}</Typography>
                                    </Box>
                                    
                                    <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
                                    
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                                            {item.nome_paciente || 'Paciente Padrão'}
                                        </Typography>
                                        <Typography variant="body2" color="#64748B" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                                            {item.nome_medico} <Box component="span" sx={{ color: '#CBD5E1', mx: 1 }}>•</Box> <Box component="span" sx={{ color: '#32B5FE' }}>{item.especialidade || 'Consulta'}</Box>
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Chip 
                                    label={(item.status || 'Confirmado').toUpperCase()} 
                                    sx={{ 
                                        fontWeight: 800, fontSize: '0.7rem', height: 28, px: 1, borderRadius: '8px', letterSpacing: '0.5px',
                                        bgcolor: item.status === 'Em Espera' ? '#FEFCE8' : '#ECFDF5', 
                                        color: item.status === 'Em Espera' ? '#F59E0B' : '#10B981', 
                                        border: '1px solid', 
                                        borderColor: item.status === 'Em Espera' ? '#FEF08A' : '#A7F3D0'
                                    }} 
                                />
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ p: 6, textAlign: 'center', opacity: 0.6 }}>
                            <AlertCircle size={40} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" fontWeight={800} color="#64748B">Nenhum atendimento próximo.</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>A agenda da unidade está livre nas próximas horas.</Typography>
                        </Box>
                    )}
                </Paper>
                <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={900}>Agenda Completa da Clínica</Typography>
                        <IconButton onClick={() => setModalOpen(false)}><X /></IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: '16px' }}>
                            <IconButton onClick={() => alterarDia(-1)}><ChevronLeft /></IconButton>
                            <TextField fullWidth type="date" value={dataFiltro} onChange={(e) => { setDataFiltro(e.target.value); buscarAgendaCompleta(e.target.value); }} />
                            <IconButton onClick={() => alterarDia(1)}><ChevronRight /></IconButton>
                        </Box>

                        {loadingAgenda ? <CircularProgress /> : (
                            <List>
                                {agendaCompleta.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina).map(item => (
                                    <ListItem key={item.id} sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <Box>
                                                <Typography fontWeight={800}>{item.nome_paciente}</Typography>
                                                <Typography variant="caption" color="text.secondary">Médico: {item.nome_medico} • {item.horario}</Typography>
                                            </Box>
                                            <Chip label={item.status} size="small" />
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {agendaCompleta.length > itensPorPagina && (
                            <Pagination count={Math.ceil(agendaCompleta.length / itensPorPagina)} page={paginaAtual} onChange={(_, v) => setPaginaAtual(v)} sx={{ mt: 3, display: 'flex', justifyContent: 'center' }} />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default DashboardClinica;