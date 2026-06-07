import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, Avatar, Chip, Button, 
    IconButton, CircularProgress, TextField, InputAdornment, 
    Tooltip, Badge, Dialog, DialogTitle, DialogContent, 
    DialogActions, Fade, Stack, Tabs, Tab, Alert, AlertTitle,
    List, ListItem 
} from '@mui/material';
import { 
    Search, FilterX, MapPin, Play, FileText, 
    History, Calendar as CalIcon, Activity, AlertCircle, 
    Download, XCircle, Paperclip, Stethoscope,
    ChevronLeft, ChevronRight, X, Clock // Ícone Clock adicionado
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgendaMedica = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Relógio em tempo real para controle do botão "Atender"
    const [horaAtual, setHoraAtual] = useState(new Date());

    // Filtros da tela principal
    const [filtroData, setFiltroData] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Todos'); 
    const [buscaNome, setBuscaNome] = useState('');
    
    const navigate = useNavigate();

    // Estados do Modal de Histórico
    const [openHistorico, setOpenHistorico] = useState(false);
    const [dadosHistorico, setDadosHistorico] = useState([]);
    const [loadingHist, setLoadingHist] = useState(false);

    // Estados do Modal de Cancelamento
    const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
    const [motivoTexto, setMotivoTexto] = useState('');

    // Estados do Modal de Agenda Completa
    const [modalAgendaOpen, setModalAgendaOpen] = useState(false);
    const [dataAgendaFiltro, setDataAgendaFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [agendaCompleta, setAgendaCompleta] = useState([]);
    const [loadingAgendaCompleta, setLoadingAgendaCompleta] = useState(false);

    // ==========================================
    // RELÓGIO AUTOMÁTICO (Atualiza a cada 1 minuto)
    // ==========================================
    useEffect(() => {
        const interval = setInterval(() => {
            setHoraAtual(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

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

    const carregarAgendaCompleta = async (dataBusca) => {
        setLoadingAgendaCompleta(true);
        try {
            const response = await api.get(`/profissional/agenda?data=${dataBusca}`);
            const ordenada = response.data.sort((a, b) => {
                const horaA = a.horario || a.hora || '00:00';
                const horaB = b.horario || b.hora || '00:00';
                return horaA.localeCompare(horaB);
            });
            setAgendaCompleta(ordenada);
        } catch (error) {
            console.error("Erro ao carregar agenda completa:", error);
        } finally {
            setLoadingAgendaCompleta(false);
        }
    };

    const alterarDiaAgenda = (dias) => {
        const d = new Date(dataAgendaFiltro + 'T12:00:00');
        d.setDate(d.getDate() + dias);
        const novaData = d.toISOString().split('T')[0];
        setDataAgendaFiltro(novaData);
        carregarAgendaCompleta(novaData);
    };

    const abrirAgendaCompleta = () => {
        setModalAgendaOpen(true);
        carregarAgendaCompleta(dataAgendaFiltro);
    };

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

    const baixarExame = (base64, nomeArquivo) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = nomeArquivo || 'exame_paciente.pdf';
        link.click();
    };

    const abrirMotivo = (motivo) => {
        setMotivoTexto(motivo || 'O paciente não informou um motivo específico.');
        setModalMotivoOpen(true);
    };

    const limparFiltros = () => {
        setFiltroData('');
        setFiltroStatus('Todos');
        setBuscaNome('');
    };

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

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'agendado' || s === 'confirmado') return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
        if (s === 'pendente pagamento' || s === 'pendente') return { bg: '#FEFCE8', color: '#EAB308', border: '#FEF08A' };
        if (s === 'concluido' || s === 'finalizado') return { bg: '#F0F9FF', color: '#32B5FE', border: '#BAE6FD' };
        if (s === 'cancelado') return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' };
        return { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' }; 
    };

    const getPesoStatus = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'agendado' || s === 'confirmado') return 1; 
        if (s === 'pendente pagamento' || s === 'pendente') return 2; 
        if (s === 'cancelado') return 3; 
        if (s === 'concluido' || s === 'finalizado') return 4; 
        return 5;
    };

    const agendaOrdenada = [...agenda].sort((a, b) => {
        const pesoA = getPesoStatus(a.status);
        const pesoB = getPesoStatus(b.status);
        if (pesoA !== pesoB) return pesoA - pesoB; 
        const horaA = a.horario || a.hora || '00:00';
        const horaB = b.horario || b.hora || '00:00';
        return horaA.localeCompare(horaB);
    });

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
                            <Chip icon={<Activity size={14} color="#64748B"/>} label={`${agendaOrdenada.length} Agendamentos`} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '8px' }} />
                        </Box>
                    </Box>
                    
                    <Button 
                        variant="contained" 
                        startIcon={<CalIcon size={20}/>} 
                        onClick={abrirAgendaCompleta} 
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
                    p: 2.5, mb: 2, borderRadius: '20px', border: '1px solid #F1F5F9', 
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

                {/* ABAS DE STATUS */}
                <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 4 }}>
                    <Tabs 
                        value={filtroStatus} 
                        onChange={(e, newValue) => setFiltroStatus(newValue)} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        sx={{ 
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', minWidth: 'auto', px: 3 }, 
                            '& .Mui-selected': { color: '#32B5FE' }, 
                            '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3, borderRadius: '3px 3px 0 0' } 
                        }}
                    >
                        <Tab label="Todos" value="Todos" />
                        <Tab label="Agendados (Pagos)" value="Agendado" />
                        <Tab label="Pendentes" value="Pendente pagamento" />
                        <Tab label="Concluídos" value="Concluido" />
                        <Tab label="Cancelados" value="Cancelado" />
                    </Tabs>
                </Box>

                {/* LISTA DE CARDS DE AGENDAMENTO */}
                <Grid container spacing={3}>
                    {loading ? (
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Buscando agenda...</Typography>
                        </Box>
                    ) : agendaOrdenada.length === 0 ? (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 10, opacity: 0.6 }}>
                            <AlertCircle size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" color="#64748B" fontWeight={800}>Nenhum agendamento encontrado.</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>Tente alterar os filtros de busca.</Typography>
                        </Box>
                    ) : (
                        agendaOrdenada.map((item) => {
                            const style = getStatusStyle(item.status || 'Confirmado');
                            const nomePaciente = item.paciente || item.paciente_nome || 'Paciente N/I';

                            return (
                                <Grid item xs={12} key={item.id}>
                                    <Paper elevation={0} sx={{ 
                                        borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', transition: 'all 0.3s ease',
                                        bgcolor: 'white', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                        opacity: item.status === 'Cancelado' ? 0.75 : 1, 
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(50, 181, 254, 0.15)', borderColor: '#32B5FE' }
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                            
                                            {/* Bloco de Data e Hora */}
                                            <Box sx={{ 
                                                width: { xs: '100%', md: 180 }, bgcolor: '#F8FAFC', borderRight: { md: '1px dashed #CBD5E1' }, borderBottom: { xs: '1px dashed #CBD5E1', md: 'none' },
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4
                                            }}>
                                                <Typography variant="h3" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-1px' }}>{item.horario || item.hora}</Typography>
                                                <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ letterSpacing: 1, mt: 0.5 }}>{item.data || item.data_formatada}</Typography>
                                                <Chip label={item.tipo || 'Consulta'} size="small" sx={{ mt: 2, fontWeight: 800, fontSize: '0.65rem', bgcolor: '#E2E8F0', color: '#475569', borderRadius: '6px' }} />
                                            </Box>

                                            {/* Bloco de Informações do Paciente */}
                                            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 3 }}>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{ '& .MuiBadge-badge': { bgcolor: style.color, width: 14, height: 14, borderRadius: '50%', border: '2px solid #FFF' } }}>
                                                        <Avatar src={item.foto_paciente} sx={{ width: 64, height: 64, bgcolor: '#0F172A', color: '#FFF', fontWeight: 900, fontSize: '1.5rem', border: '2px solid #F1F5F9' }}>
                                                            {!item.foto_paciente && nomePaciente[0].toUpperCase()}
                                                        </Avatar>
                                                    </Badge>
                                                    
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ mb: 0.5 }}>{nomePaciente}</Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 700 }}>
                                                                <MapPin size={14} color="#94A3B8"/> {item.clinica || item.clinica_nome || 'Unidade Padrão'}
                                                            </Typography>
                                                            <Chip 
                                                                label={(item.status || 'Confirmado').toUpperCase()} 
                                                                size="small" 
                                                                sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, bgcolor: style.bg, color: style.color, border: '1px solid', borderColor: style.border, borderRadius: '6px' }} 
                                                            />
                                                            {item.exame_base64 && (
                                                                <Chip 
                                                                    icon={<Paperclip size={12} />} label="Exame Anexado" size="small"
                                                                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: '6px' }} 
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                {/* Botões de Ação Dinâmicos */}
                                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', lg: 'auto' } }}>
                                                    
                                                    <Button 
                                                        onClick={() => verHistorico(item.id_paciente)}
                                                        variant="outlined" size="small" startIcon={<History size={16}/>}
                                                        sx={{ flex: { xs: 1, sm: 'initial' }, borderRadius: '10px', fontWeight: 800, border: '2px solid #E2E8F0', color: '#64748B', textTransform: 'none', py: 1, '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
                                                    >
                                                        Histórico
                                                    </Button>

                                                    {item.exame_base64 && (
                                                        <Button 
                                                            variant="outlined" size="small" startIcon={<Download size={16} />} 
                                                            onClick={() => baixarExame(item.exame_base64, item.exame_nome)}
                                                            sx={{ flex: { xs: 1, sm: 'initial' }, borderRadius: '10px', fontWeight: 800, border: '2px solid #E2E8F0', color: '#0F172A', textTransform: 'none', py: 1, '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
                                                        >
                                                            Exame
                                                        </Button>
                                                    )}

                                                    {item.status === 'Cancelado' ? (
                                                        <Button 
                                                            variant="outlined" color="error" startIcon={<AlertCircle size={16} />} 
                                                            onClick={() => abrirMotivo(item.motivo_cancelamento)}
                                                            sx={{ flex: { xs: '100%', sm: 'initial' }, borderRadius: '10px', textTransform: 'none', fontWeight: 800, py: 1 }}
                                                        >
                                                            Ver Motivo
                                                        </Button>
                                                    ) : item.status === 'Concluido' || item.status === 'Finalizado' ? (
                                                        <Button 
                                                            variant="contained" startIcon={<FileText size={16}/>}
                                                            onClick={() => navigate('/dashboard/atendimento', { state: item })}
                                                            sx={{ flex: { xs: '100%', sm: 'initial' }, bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#1E293B' }, borderRadius: '10px', px: 3, py: 1, fontWeight: 800, textTransform: 'none', boxShadow: 'none' }}
                                                        >
                                                            Ver Resumo
                                                        </Button>
                                                    ) : item.status === 'Pendente pagamento' ? (
                                                        <Typography variant="body2" color="#94A3B8" fontWeight={700} sx={{ flex: { xs: '100%', sm: 'initial' }, textAlign: 'center' }}>
                                                            Aguardando pagamento
                                                        </Typography>
                                                    ) : (
                                                        // VERIFICAÇÃO DE TEMPO PARA ATENDER (LÓGICA ADICIONADA AQUI)
                                                        (() => {
                                                            const dataStr = item.data || item.data_formatada;
                                                            const horaStr = item.horario || item.hora;
                                                            let atendimentoLiberado = true;

                                                            if (dataStr && horaStr) {
                                                                try {
                                                                    const [dia, mes, ano] = dataStr.split('/');
                                                                    const [hora, min] = horaStr.split(':');
                                                                    // Formata a data agendada para comparar
                                                                    const dataAgendamento = new Date(ano, mes - 1, dia, hora, min);
                                                                    // Calcula a diferença em minutos
                                                                    const diffEmMinutos = (dataAgendamento - horaAtual) / (1000 * 60);
                                                                    
                                                                    // Só libera se faltar 15 min ou menos (ou se já tiver passado do horário)
                                                                    atendimentoLiberado = diffEmMinutos <= 15;
                                                                } catch (e) {
                                                                    atendimentoLiberado = true; // Fallback de segurança
                                                                }
                                                            }

                                                            if (!atendimentoLiberado) {
                                                                return (
                                                                    <Tooltip title="O atendimento é liberado 15 minutos antes do horário marcado." arrow>
                                                                        <span>
                                                                            <Button 
                                                                                disabled
                                                                                variant="contained" startIcon={<Clock size={16} />}
                                                                                sx={{ flex: { xs: '100%', sm: 'initial' }, bgcolor: '#F1F5F9 !important', color: '#94A3B8 !important', borderRadius: '10px', px: 3, py: 1, fontWeight: 800, textTransform: 'none', boxShadow: 'none' }}
                                                                            >
                                                                                Aguarde
                                                                            </Button>
                                                                        </span>
                                                                    </Tooltip>
                                                                );
                                                            }

                                                            return (
                                                                <Button 
                                                                    variant="contained" startIcon={<Play size={16} fill="currentColor" />}
                                                                    onClick={() => navigate('/dashboard/atendimento', { state: item })}
                                                                    sx={{ flex: { xs: '100%', sm: 'initial' }, bgcolor: '#32B5FE', color: '#FFFFFF', '&:hover': { bgcolor: '#0284C7' }, borderRadius: '10px', px: 3, py: 1, fontWeight: 800, textTransform: 'none', boxShadow: 'none' }}
                                                                >
                                                                    Atender
                                                                </Button>
                                                            );
                                                        })()
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })
                    )}
                </Grid>

                {/* MODAL DE AGENDA COMPLETA DO DIA */}
                <Dialog open={modalAgendaOpen} onClose={() => setModalAgendaOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={900}>Navegador de Agenda</Typography>
                        <IconButton onClick={() => setModalAgendaOpen(false)}><X /></IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: '16px' }}>
                            <IconButton onClick={() => alterarDiaAgenda(-1)} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}><ChevronLeft size={20} /></IconButton>
                            <TextField 
                                fullWidth 
                                type="date" 
                                size="small"
                                value={dataAgendaFiltro} 
                                onChange={(e) => { setDataAgendaFiltro(e.target.value); carregarAgendaCompleta(e.target.value); }} 
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                            />
                            <IconButton onClick={() => alterarDiaAgenda(1)} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}><ChevronRight size={20} /></IconButton>
                        </Box>

                        {loadingAgendaCompleta ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress size={30} sx={{ color: '#32B5FE' }} />
                            </Box>
                        ) : agendaCompleta.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4, opacity: 0.6 }}>
                                <CalIcon size={40} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                                <Typography variant="subtitle1" fontWeight={800} color="#64748B">Agenda Livre</Typography>
                                <Typography variant="body2" color="#94A3B8" fontWeight={500}>Nenhum paciente agendado para este dia.</Typography>
                            </Box>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {agendaCompleta.map((item) => {
                                    const style = getStatusStyle(item.status);
                                    const nomePac = item.paciente || item.paciente_nome || 'Paciente';
                                    return (
                                        <ListItem key={item.id} sx={{ borderBottom: '1px solid #F1F5F9', py: 2, px: 0, display: 'flex', gap: 2 }}>
                                            <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '12px', minWidth: 60, textAlign: 'center' }}>
                                                <Typography fontWeight={900} color="#0F172A">{item.horario || item.hora}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography fontWeight={800} color="#0F172A">{nomePac}</Typography>
                                                <Typography variant="caption" color="#64748B" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <MapPin size={12} /> {item.clinica || item.clinica_nome || 'Unidade Padrão'}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={(item.status || 'Confirmado').toUpperCase()} 
                                                size="small" 
                                                sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: style.bg, color: style.color, border: '1px solid', borderColor: style.border, borderRadius: '6px' }} 
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </DialogContent>
                </Dialog>

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
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalIcon size={14} color="#32B5FE" />
                                            <Typography variant="caption" fontWeight={900} color="#32B5FE">
                                                {h.data_formatada || h.data}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            icon={<Stethoscope size={14} />} 
                                            label={`Dr(a). ${h.profissional_nome || 'Não informado'} • CRM: ${h.profissional_crm || 'N/I'}`} 
                                            size="small" 
                                            sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#E2E8F0', color: '#475569', borderRadius: '8px', '& .MuiChip-icon': { color: '#64748B' } }} 
                                        />
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

                {/* MODAL: MOTIVO DO CANCELAMENTO */}
                <Dialog open={modalMotivoOpen} onClose={() => setModalMotivoOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ pb: 1 }}>
                        <Typography variant="h6" fontWeight={900} color="#0F172A">Consulta Cancelada</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Alert severity="error" icon={<XCircle size={24} />} sx={{ mt: 2, borderRadius: '12px', '& .MuiAlert-message': { width: '100%' } }}>
                            <AlertTitle sx={{ fontWeight: 800 }}>Motivo informado pelo paciente:</AlertTitle>
                            <Typography variant="body1" fontWeight={500} sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{motivoTexto}"
                            </Typography>
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button variant="contained" onClick={() => setModalMotivoOpen(false)} sx={{ bgcolor: '#0F172A', borderRadius: '10px', fontWeight: 800, boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#1E293B' } }}>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Fade>
    );
};

export default AgendaMedica;