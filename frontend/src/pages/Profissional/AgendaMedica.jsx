import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, Avatar, Chip, Button, 
    IconButton, CircularProgress, TextField, MenuItem, 
    InputAdornment, Tooltip, Divider, Badge,
    Dialog, DialogTitle, DialogContent, DialogActions, Fade, Stack
} from '@mui/material';
import { 
    Search, FilterX, MapPin, Play, FileText, 
    History, Calendar as CalIcon, Activity, Clock, AlertCircle
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
        if (!idPaciente) return alert("Paciente não identificado.");
        setLoadingHist(true);
        setOpenHistorico(true);
        try {
            const response = await api.get(`/profissional/historico-paciente/${idPaciente}`);
            setDadosHistorico(response.data);
        } catch (error) {
            console.error("Erro ao carregar histórico");
        } finally {
            setLoadingHist(false);
        }
    };

    const limparFiltros = () => {
        setFiltroData('');
        setFiltroStatus('Todos');
        setBuscaNome('');
    };

    // Estilo Moderno para Inputs
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        }
    };

    // Definir as cores do Status
    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'confirmado' || s === 'pago') return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
        if (s === 'em espera' || s === 'pendente') return { bg: '#FEFCE8', color: '#EAB308', border: '#FEF08A' };
        if (s === 'finalizado') return { bg: '#F0F9FF', color: '#32B5FE', border: '#BAE6FD' };
        return { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' }; 
    };

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* HEADER */}
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1.5px' }}>
                            Painel de Atendimento
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                            <Chip icon={<Activity size={14} color="#64748B"/>} label={`${agenda.length} Agendamentos`} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '8px' }} />
                        </Box>
                    </Box>
                    
                    <Button 
                        variant="contained" 
                        startIcon={<CalIcon size={20}/>} 
                        sx={{ 
                            bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 10px 20px -10px rgba(50, 181, 254, 0.5)' }, 
                            borderRadius: '12px', px: 3, py: 1.2, fontWeight: 800, textTransform: 'none', color: '#FFFFFF',
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)', transition: 'all 0.3s'
                        }}
                    >
                        Ver Agenda Completa
                    </Button>
                </Box>

                {/* BARRA DE FILTROS */}
                <Paper elevation={0} sx={{ 
                    p: 2.5, mb: 5, borderRadius: '20px', border: '1px solid #F1F5F9', 
                    display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', 
                    bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                }}>
                    <TextField
                        placeholder="Buscar paciente..."
                        size="small"
                        value={buscaNome}
                        onChange={(e) => setBuscaNome(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: '250px', ...modernInputStyle }}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Search size={18} color="#94A3B8"/></InputAdornment>)
                        }}
                    />

                    <TextField
                        select
                        size="small"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        sx={{ width: 180, ...modernInputStyle }}
                        InputProps={{ sx: { fontWeight: 700, color: '#0F172A' } }}
                    >
                        <MenuItem value="Todos" sx={{ fontWeight: 600 }}>Todos os Status</MenuItem>
                        <MenuItem value="Confirmado" sx={{ fontWeight: 600 }}>Confirmados</MenuItem>
                        <MenuItem value="Pendente" sx={{ fontWeight: 600 }}>Pendentes</MenuItem>
                        <MenuItem value="Finalizado" sx={{ fontWeight: 600 }}>Finalizados</MenuItem>
                    </TextField>

                    <TextField
                        type="date"
                        size="small"
                        value={filtroData}
                        onChange={(e) => setFiltroData(e.target.value)}
                        sx={{ width: 180, ...modernInputStyle }}
                        InputProps={{ sx: { fontWeight: 700, color: '#0F172A' } }}
                    />

                    <Tooltip title="Limpar Filtros" arrow>
                        <IconButton onClick={limparFiltros} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '12px', '&:hover': { bgcolor: '#FECACA' }, width: 40, height: 40 }}>
                            <FilterX size={20} />
                        </IconButton>
                    </Tooltip>
                </Paper>

                {/* LISTA DE CARDS DE AGENDAMENTO */}
                <Grid container spacing={3}>
                    {loading ? (
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Buscando agenda...</Typography>
                        </Box>
                    ) : agenda.length === 0 ? (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 10, opacity: 0.6 }}>
                            <AlertCircle size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" color="#64748B" fontWeight={800}>Nenhum agendamento encontrado.</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>Tente alterar os filtros de busca.</Typography>
                        </Box>
                    ) : (
                        agenda.map((item) => {
                            const style = getStatusStyle(item.status || 'Confirmado'); // Fallback para Confirmado
                            const nomePaciente = item.paciente || item.nome_paciente || 'Paciente N/I';

                            return (
                                <Grid item xs={12} key={item.id}>
                                    <Paper elevation={0} sx={{ 
                                        borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', transition: 'all 0.3s ease',
                                        bgcolor: 'white', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(50, 181, 254, 0.15)', borderColor: '#32B5FE' }
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                            
                                            {/* Bloco de Data e Hora */}
                                            <Box sx={{ 
                                                width: { xs: '100%', md: 180 }, bgcolor: '#F8FAFC', borderRight: { md: '1px dashed #CBD5E1' }, borderBottom: { xs: '1px dashed #CBD5E1', md: 'none' },
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4
                                            }}>
                                                <Typography variant="h3" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-1px' }}>{item.horario || item.hora}</Typography>
                                                <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ letterSpacing: 1, mt: 0.5 }}>{item.data_agendamento || item.data}</Typography>
                                                <Chip label={item.tipo || 'Consulta'} size="small" sx={{ mt: 2, fontWeight: 800, fontSize: '0.65rem', bgcolor: '#E2E8F0', color: '#475569', borderRadius: '6px' }} />
                                            </Box>

                                            {/* Bloco de Informações do Paciente */}
                                            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 3 }}>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{ '& .MuiBadge-badge': { bgcolor: style.color, width: 14, height: 14, borderRadius: '50%', border: '2px solid #FFF' } }}>
                                                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#0F172A', color: '#FFF', fontWeight: 900, fontSize: '1.5rem', border: '2px solid #F1F5F9' }}>
                                                            {nomePaciente[0].toUpperCase()}
                                                        </Avatar>
                                                    </Badge>
                                                    
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ mb: 0.5 }}>{nomePaciente}</Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 700 }}>
                                                                <MapPin size={14} color="#94A3B8"/> {item.clinica || item.nome_clinica || 'Unidade Padrão'}
                                                            </Typography>
                                                            <Chip 
                                                                label={(item.status || 'Confirmado').toUpperCase()} 
                                                                size="small" 
                                                                sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, bgcolor: style.bg, color: style.color, border: '1px solid', borderColor: style.border, borderRadius: '6px' }} 
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                {/* Botões de Ação */}
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', lg: 'auto' } }}>
                                                    <Button 
                                                        onClick={() => verHistorico(item.id_paciente)}
                                                        variant="outlined" size="small" startIcon={<History size={16}/>}
                                                        sx={{ 
                                                            flex: { xs: 1, lg: 'initial' }, borderRadius: '10px', fontWeight: 800, border: '2px solid #E2E8F0', color: '#64748B', textTransform: 'none', py: 1,
                                                            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }
                                                        }}
                                                    >
                                                        Histórico
                                                    </Button>

                                                    <Button 
                                                        variant="contained" startIcon={item.status === 'Finalizado' ? <FileText size={16}/> : <Play size={16} fill="currentColor" />}
                                                        onClick={() => navigate('/dashboard/atendimento', { state: item })}
                                                        sx={{ 
                                                            flex: { xs: 1, lg: 'initial' }, bgcolor: item.status === 'Finalizado' ? '#F1F5F9' : '#0F172A', 
                                                            color: item.status === 'Finalizado' ? '#0F172A' : '#FFFFFF',
                                                            '&:hover': { bgcolor: item.status === 'Finalizado' ? '#E2E8F0' : '#32B5FE' }, 
                                                            borderRadius: '10px', px: 3, py: 1, fontWeight: 800, textTransform: 'none', boxShadow: 'none' 
                                                        }}
                                                    >
                                                        {item.status === 'Finalizado' ? 'Ver Resumo' : 'Atender'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })
                    )}
                </Grid>

                {/* MODAL DE HISTÓRICO PREMIUM */}
                <Dialog open={openHistorico} onClose={() => setOpenHistorico(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', pb: 1 }}>Histórico Clínico</DialogTitle>
                    <DialogContent dividers sx={{ borderColor: '#F1F5F9' }}>
                        {loadingHist ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, gap: 2 }}>
                                <CircularProgress size={32} sx={{ color: '#32B5FE' }} />
                                <Typography variant="caption" fontWeight={700} color="#94A3B8">Recuperando prontuários...</Typography>
                            </Box>
                        ) : dadosHistorico.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4, opacity: 0.6 }}>
                                <FileText size={40} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                                <Typography variant="subtitle1" fontWeight={800} color="#64748B">Primeira Consulta</Typography>
                                <Typography variant="body2" color="#94A3B8" fontWeight={500}>Nenhum atendimento anterior registrado.</Typography>
                            </Box>
                        ) : (
                            dadosHistorico.map((h, i) => (
                                <Box key={i} sx={{ mb: 3, p: 3, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalIcon size={14} color="#32B5FE" />
                                        <Typography variant="caption" fontWeight={900} color="#32B5FE">{h.data_formatada || h.data}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>Evolução Clínica:</Typography>
                                    <Typography variant="body2" color="#475569" sx={{ mb: 2, lineHeight: 1.6 }}>{h.evolucao || h.notas}</Typography>
                                    
                                    {h.prescricao && (
                                        <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                                            <Typography variant="caption" fontWeight={900} color="#047857" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <FileText size={14} /> PRESCRIÇÃO MÉDICA
                                            </Typography>
                                            <Typography variant="body2" color="#065F46" fontWeight={600}>{h.prescricao}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenHistorico(false)} sx={{ fontWeight: 800, color: '#64748B', borderRadius: '10px', '&:hover': { bgcolor: '#F1F5F9' } }}>Fechar Janela</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default AgendaMedica;