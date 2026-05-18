import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, Avatar, Chip, Button, 
    IconButton, CircularProgress, TextField, MenuItem, 
    InputAdornment, Tooltip, Divider, Badge
} from '@mui/material';
import { 
    Search, FilterX, MapPin, Play, FileText, 
    History, MoreHorizontal, Calendar as CalIcon, 
    User, ChevronRight, Activity, Clock
} from 'lucide-react';

const AgendaMedica = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [filtroData, setFiltroData] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos');
    const [buscaNome, setBuscaNome] = useState('');

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

    const limparFiltros = () => {
        setFiltroData('');
        setFiltroStatus('Todos');
        setBuscaNome('');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F1F5F9', minHeight: '100vh' }}>
            
            {/* HEADER COM STATUS DO DIA */}
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
                
                <Button variant="contained" startIcon={<CalIcon size={20}/>} sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' },  borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none', display: { xs: 'none', md: 'flex' }, color: '#FFFFFF' }}>
                    Ver Agenda Completa
                </Button>
            </Box>

            {/* BARRA DE FILTROS ESTILIZADA */}
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

            {/* LISTA DE CARDS OPERACIONAIS */}
            <Grid container spacing={3}>
                {loading ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="inherit" /></Box>
                ) : agenda.length === 0 ? (
                    <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                        <Typography variant="h6" color="text.secondary" fontWeight={700}>Nenhum paciente encontrado para os filtros aplicados.</Typography>
                    </Box>
                ) : (
                    agenda.map((item) => (
                        <Grid item xs={12} key={item.id}>
                            <Paper sx={{ 
                                borderRadius: 5, border: '1px solid #E2E8F0', overflow: 'hidden', transition: '0.3s',
                                '&:hover': { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', borderColor: '#32B5FE' }
                            }} elevation={0}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    
                                    {/* BLOCO DE HORÁRIO */}
                                    <Box sx={{ 
                                        width: { xs: '100%', md: 160 }, bgcolor: '#F8FAF9', borderRight: { md: '1px solid #E2E8F0' },
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3
                                    }}>
                                        <Typography variant="h4" fontWeight={900} color="#0F172A">{item.hora}</Typography>
                                        <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ letterSpacing: 1 }}>{item.data}</Typography>
                                        <Chip label={item.tipo} size="small" sx={{ mt: 1.5, fontWeight: 800, fontSize: '0.6rem', bgcolor: '#E2E8F0' }} />
                                    </Box>

                                    {/* BLOCO DE INFORMAÇÕES */}
                                    <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={item.status === 'Confirmado' ? 'success' : 'warning'}>
                                                <Avatar sx={{ width: 64, height: 64, bgcolor: '#0F172A', fontWeight: 900, fontSize: '1.5rem', border: '3px solid #F1F5F9' }}>
                                                    {item.paciente[0]}
                                                </Avatar>
                                            </Badge>
                                            <Box>
                                                <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ mb: 0.5 }}>{item.paciente}</Typography>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 700 }}>
                                                        <MapPin size={14}/> {item.clinica}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: item.status === 'Confirmado' ? '#16A34A' : '#D97706', fontWeight: 800 }}>
                                                        ● {item.status.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* AÇÕES DE PRONTUÁRIO E ATENDIMENTO */}
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Tooltip title="Ver Histórico Médico">
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    startIcon={<History size={18}/>}
                                                    sx={{ borderRadius: 3, fontWeight: 700, border: '2px solid #E2E8F0', color: '#475569', textTransform: 'none' }}
                                                >
                                                    Histórico
                                                </Button>
                                            </Tooltip>

                                            <Tooltip title="Abrir Prontuário">
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    startIcon={<FileText size={18}/>}
                                                    sx={{ borderRadius: 3, fontWeight: 700, border: '2px solid #E2E8F0', color: '#475569', textTransform: 'none' }}
                                                >
                                                    Prontuário
                                                </Button>
                                            </Tooltip>

                                            <Button 
                                                variant="contained" 
                                                startIcon={<Play size={18}/>}
                                                sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' }, borderRadius: 3, px: 3, fontWeight: 800, textTransform: 'none', color: '#FFFFFF' }}
                                            >
                                                Atender
                                            </Button>

                                            <IconButton sx={{ bgcolor: '#F8FAF9' }}><MoreHorizontal size={20}/></IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default AgendaMedica;