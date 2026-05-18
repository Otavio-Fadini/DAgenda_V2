import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, Avatar, Chip, Button, 
    IconButton, CircularProgress, TextField, MenuItem, 
    InputAdornment, Tooltip, Divider, Badge,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
    Search, FilterX, MapPin, Play, FileText, 
    History, MoreHorizontal, Calendar as CalIcon, 
    User, ChevronRight, Activity, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgendaMedica = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [filtroData, setFiltroData] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [buscaNome, setBuscaNome] = useState('');
    
    const navigate = useNavigate();

    // Estados do Modal de Histórico
    const [openHistorico, setOpenHistorico] = useState(false);
    const [dadosHistorico, setDadosHistorico] = useState([]);
    const [loadingHist, setLoadingHist] = useState(false);

    const carregarAgenda = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtroData) params.append('data', filtroData);
            if (filtroStatus !== 'Todos') params.append('status', filtroStatus);
            if (buscaNome) params.append('busca', buscaNome);

            const response = await api.get(`/profissional/agenda?${params.toString()}`);
            setAgenda(response.data);
        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
        } finally {
            setLoading(false);
        }
    }, [filtroData, filtroStatus, buscaNome]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => carregarAgenda(), 500);
        return () => clearTimeout(delayDebounce);
    }, [carregarAgenda]);

    const verHistorico = async (idPaciente) => {
        setLoadingHist(true);
        setOpenHistorico(true);
        try {
            const response = await api.get(`/profissional/historico-paciente/${idPaciente}`);
            setDadosHistorico(response.data);
        } catch (error) {
            alert("Erro ao carregar histórico");
            setOpenHistorico(false);
        } finally {
            setLoadingHist(false);
        }
    };

    const limparFiltros = () => {
        setFiltroData('');
        setFiltroStatus('Todos');
        setBuscaNome('');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F1F5F9', minHeight: '100vh' }}>
            
            {/* HEADER */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1.5px' }}>
                        Painel de Atendimento
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Chip icon={<Activity size={14}/>} label={`${agenda.length} Agendamentos`} size="small" sx={{ fontWeight: 700, bgcolor: '#E2E8F0' }} />
                        <Chip icon={<Clock size={14}/>} label="Próxima: 14:30" size="small" color="primary" sx={{ fontWeight: 700, bgcolor: '#32B5FE' }} />
                    </Box>
                </Box>
                
                <Button variant="contained" startIcon={<CalIcon size={20}/>} sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' }, borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none', display: { xs: 'none', md: 'flex' }, color: '#FFFFFF' }}>
                    Ver Agenda Completa
                </Button>
            </Box>

            {/* BARRA DE FILTROS */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 4, border: '1px solid #E2E8F0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                <TextField
                    placeholder="Buscar por nome do paciente..."
                    size="small"
                    value={buscaNome}
                    onChange={(e) => setBuscaNome(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '250px' }}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><Search size={18} color="#64748B"/></InputAdornment>),
                        sx: { borderRadius: 3, bgcolor: 'white' }
                    }}
                />

                <TextField
                    select
                    size="small"
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    sx={{ width: 160 }}
                    InputProps={{ sx: { borderRadius: 3, bgcolor: 'white', fontWeight: 700 } }}
                >
                    <MenuItem value="Todos">Todos Status</MenuItem>
                    <MenuItem value="Confirmado">Confirmados</MenuItem>
                    <MenuItem value="Pendente">Pendentes</MenuItem>
                    <MenuItem value="Finalizado">Finalizados</MenuItem>
                </TextField>

                <TextField
                    type="date"
                    size="small"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    sx={{ width: 180 }}
                    InputProps={{ sx: { borderRadius: 3, bgcolor: 'white', fontWeight: 700 } }}
                />

                <IconButton onClick={limparFiltros} sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}>
                    <FilterX size={20} />
                </IconButton>
            </Paper>

            {/* LISTA DE CARDS */}
            <Grid container spacing={3}>
                {loading ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="primary" /></Box>
                ) : agenda.length === 0 ? (
                    <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                        <Typography variant="h6" color="text.secondary" fontWeight={700}>Nenhum agendamento encontrado.</Typography>
                    </Box>
                ) : (
                    agenda.map((item) => (
                        <Grid item xs={12} key={item.id}>
                            <Paper sx={{ 
                                borderRadius: 5, border: '1px solid #E2E8F0', overflow: 'hidden', transition: '0.3s',
                                '&:hover': { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', borderColor: '#32B5FE' }
                            }} elevation={0}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    
                                    <Box sx={{ 
                                        width: { xs: '100%', md: 160 }, bgcolor: '#F8FAF9', borderRight: { md: '1px solid #E2E8F0' },
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3
                                    }}>
                                        <Typography variant="h4" fontWeight={900} color="#0F172A">{item.hora}</Typography>
                                        <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ letterSpacing: 1 }}>{item.data}</Typography>
                                        <Chip label={item.tipo} size="small" sx={{ mt: 1.5, fontWeight: 800, fontSize: '0.6rem', bgcolor: '#E2E8F0' }} />
                                    </Box>

                                    <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={item.status === 'Confirmado' ? 'success' : 'warning'}>
                                                <Avatar sx={{ width: 64, height: 64, bgcolor: '#0F172A', fontWeight: 900, fontSize: '1.5rem' }}>
                                                    {item.paciente[0]}
                                                </Avatar>
                                            </Badge>
                                            <Box>
                                                <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ mb: 0.5 }}>{item.paciente}</Typography>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 700 }}>
                                                        <MapPin size={14}/> {item.clinica}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: item.status === 'Finalizado' ? '#32B5FE' : item.status === 'Confirmado' ? '#16A34A' : '#D97706', fontWeight: 800 }}>
                                                        ● {item.status.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Button 
                                                onClick={() => verHistorico(item.id_paciente)}
                                                variant="outlined" size="small" startIcon={<History size={18}/>}
                                                sx={{ borderRadius: 3, fontWeight: 700, border: '2px solid #E2E8F0', color: '#475569', textTransform: 'none' }}
                                            >
                                                Histórico
                                            </Button>

                                            <Button 
                                                variant="contained" startIcon={<Play size={18}/>}
                                                onClick={() => navigate('/dashboard/atendimento', { state: item })}
                                                disabled={item.status === 'Finalizado'}
                                                sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' }, borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none', color: '#FFFFFF' }}
                                            >
                                                {item.status === 'Finalizado' ? 'Atendido' : 'Atender'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* MODAL DE HISTÓRICO */}
            <Dialog open={openHistorico} onClose={() => setOpenHistorico(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 900, color: '#0F172A' }}>Histórico do Paciente</DialogTitle>
                <DialogContent dividers>
                    {loadingHist ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>
                    ) : dadosHistorico.length === 0 ? (
                        <Typography color="text.secondary">Nenhum atendimento anterior encontrado.</Typography>
                    ) : (
                        dadosHistorico.map((h, i) => (
                            <Box key={i} sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" fontWeight={900} color="primary">{h.data_formatada}</Typography>
                                <Typography variant="body2" fontWeight={800} sx={{ mt: 1 }}>Evolução:</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{h.evolucao}</Typography>
                                {h.prescricao && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2" fontWeight={800} color="secondary">Prescrição:</Typography>
                                        <Typography variant="body2" color="text.secondary">{h.prescricao}</Typography>
                                    </>
                                )}
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenHistorico(false)} sx={{ fontWeight: 800, color: '#0F172A' }}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AgendaMedica;