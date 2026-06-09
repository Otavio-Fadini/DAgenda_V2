import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Paper, Avatar, Button, Fade, Chip, Divider, Stack, CircularProgress,
    Dialog, DialogTitle, DialogContent, TextField, IconButton, InputAdornment, List, ListItem, Pagination
} from '@mui/material';
import { 
    Stethoscope, ShieldCheck, CalendarClock, AlertCircle, UserPlus, Search, X, Send, Calendar,
    ChevronLeft, ChevronRight 
} from 'lucide-react';
import api from '../../services/api';

const MedicosUnidade = () => {
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Estados para o Modal de Convites ---
    const [modalOpen, setModalOpen] = useState(false);
    const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState([]);
    const [buscandoProximos, setBuscandoProximos] = useState(false);
    const [termoBusca, setTermoBusca] = useState('');
    const [conviteLoading, setConviteLoading] = useState(null);

    // --- Estados para o Modal de Agenda ---
    const [modalAgendaOpen, setModalAgendaOpen] = useState(false);
    const [medicoSelecionado, setMedicoSelecionado] = useState(null);
    const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]); // Hoje
    const [agendaLista, setAgendaLista] = useState([]);
    const [loadingAgenda, setLoadingAgenda] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 5;

    useEffect(() => {
        carregarMedicos();
    }, []);

    const carregarMedicos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/clinica/medicos-unidade');
            setMedicos(response.data);
        } catch (error) {
            console.error("Erro ao carregar médicos vinculados:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE CONVITES ---
    const handleOpenModal = () => { setModalOpen(true); buscarProfissionaisProximos(); };
    const handleCloseModal = () => { setModalOpen(false); setTermoBusca(''); };

    const buscarProfissionaisProximos = async () => {
        setBuscandoProximos(true);
        try {
            const response = await api.get('/clinica/buscar-profissionais');
            setProfissionaisDisponiveis(response.data);
        } catch (error) { console.error("Erro:", error); } 
        finally { setBuscandoProximos(false); }
    };

    const handleEnviarConvite = async (profissionalId) => {
        setConviteLoading(profissionalId);
        try {
            await api.post('/clinica/enviar-convite', { profissional_id: profissionalId });
            setProfissionaisDisponiveis(prev => prev.filter(p => p.id !== profissionalId));
            alert("Convite enviado com sucesso!");
        } catch (error) { alert("Erro ao enviar o convite."); } 
        finally { setConviteLoading(null); }
    };

    const profissionaisFiltrados = profissionaisDisponiveis.filter(p => 
        p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
        (p.especialidade && p.especialidade.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    // --- LÓGICA DA AGENDA DO MÉDICO ---
    const buscarAgenda = async (medicoId, dataSelecionada) => {
        setLoadingAgenda(true);
        try {
            const response = await api.get(`/clinica/medicos/${medicoId}/agenda`, {
                params: { data: dataSelecionada }
            });
            setAgendaLista(response.data);
        } catch (error) {
            console.error("Erro ao buscar agenda:", error);
        } finally {
            setLoadingAgenda(false);
        }
    };

    const handleOpenAgenda = (medico) => {
        setMedicoSelecionado(medico);
        setModalAgendaOpen(true);
        const hoje = new Date().toISOString().split('T')[0];
        setDataFiltro(hoje);
        setPaginaAtual(1);
        buscarAgenda(medico.id, hoje);
    };

    const handleCloseAgenda = () => {
        setModalAgendaOpen(false);
        setMedicoSelecionado(null);
        setAgendaLista([]);
        setPaginaAtual(1);
    };

    const handleDataChange = (e) => {
        const novaData = e.target.value;
        setDataFiltro(novaData);
        setPaginaAtual(1);
        if (medicoSelecionado) {
            buscarAgenda(medicoSelecionado.id, novaData);
        }
    };

    const alterarDia = (quantidadeDias) => {
        const dataAtual = new Date(dataFiltro + 'T12:00:00'); 
        dataAtual.setDate(dataAtual.getDate() + quantidadeDias);
        const novaData = dataAtual.toISOString().split('T')[0];
        
        setDataFiltro(novaData);
        setPaginaAtual(1);
        
        if (medicoSelecionado) {
            buscarAgenda(medicoSelecionado.id, novaData);
        }
    };

    // --- LÓGICA VISUAL DOS STATUS CORRIGIDA
    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'agendado' || s === 'confirmado') {
            return { bgcolor: '#ECFDF5', color: '#10B981', borderColor: '#A7F3D0' };
        }
        if (s === 'pendente pagamento' || s === 'pendente') {
            return { bgcolor: '#FEFCE8', color: '#EAB308', borderColor: '#FEF08A' };
        }
        if (s === 'concluido' || s === 'finalizado') {
            return { bgcolor: '#F0F9FF', color: '#0EA5E9', borderColor: '#BAE6FD' };
        }
        if (s === 'cancelado') {
            return { bgcolor: '#FEF2F2', color: '#EF4444', borderColor: '#FECACA' };
        }
        // Padrão
        return { bgcolor: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }; 
    };

    // --- CÁLCULOS DE PAGINAÇÃO ---
    const indexOfLastItem = paginaAtual * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const agendaPaginada = agendaLista.slice(indexOfFirstItem, indexOfLastItem);
    const totalPaginas = Math.ceil(agendaLista.length / itensPorPagina);

    return (
        <Fade in={true} timeout={600}>
            <Box className="responsive-page" sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#F8FAFC', minHeight: { xs: '100dvh', md: '100%' }, width: '100%', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>Corpo Clínico</Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>Gerencie os especialistas vinculados à sua unidade.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip label={`${medicos.length} PROFISSIONAIS`} sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', px: 1, height: 32, borderRadius: '8px' }} />
                        <Button variant="contained" startIcon={<UserPlus size={18} />} onClick={handleOpenModal} sx={{ bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' }, fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 3, boxShadow: '0 4px 12px rgba(50, 181, 254, 0.3)', transition: 'all 0.2s' }}>
                            Encontrar Profissionais
                        </Button>
                    </Box>
                </Box>
                
                {/* LISTAGEM DE MÉDICOS */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} /></Box>
                ) : medicos.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0', bgcolor: 'transparent', mt: 4 }}>
                        <AlertCircle size={50} color="#CBD5E1" style={{ marginBottom: 16 }} strokeWidth={1.5} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748B', mb: 1 }}>Nenhum médico vinculado</Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, mb: 3 }}>Não há profissionais de saúde atrelados a esta unidade no momento.</Typography>
                        <Button variant="outlined" onClick={handleOpenModal} sx={{ fontWeight: 800, borderRadius: '10px', borderColor: '#E2E8F0', color: '#64748B', textTransform: 'none' }}>Procurar na região</Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {medicos.map((medico) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={medico.id}>
                                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white', textAlign: 'center', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 40px -10px rgba(50, 181, 254, 0.15)', borderColor: '#32B5FE' } }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', bgcolor: 'rgba(50, 181, 254, 0.05)' }} />
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ position: 'relative', width: 90, height: 90, mx: 'auto', mb: 2 }}>
                                            <Avatar src={medico.foto_perfil} sx={{ width: 90, height: 90, bgcolor: '#FFFFFF', color: '#32B5FE', border: '4px solid #F8FAFC', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '2rem', fontWeight: 900 }}>
                                                {medico.nome ? medico.nome[0].toUpperCase() : <Stethoscope size={40} strokeWidth={1.5} />}
                                            </Avatar>
                                            <Box sx={{ position: 'absolute', bottom: -2, right: -2, bgcolor: '#10B981', borderRadius: '50%', p: 0.5, border: '2px solid #FFF', display: 'flex' }}><ShieldCheck size={14} color="#FFF" /></Box>
                                        </Box>
                                        <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>{medico.nome}</Typography>
                                        <Typography variant="caption" sx={{ color: '#32B5FE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.5, display: 'block' }}>{medico.especialidade}</Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mt: 0.5, display: 'block' }}>CRM {medico.conselho || 'N/I'}</Typography>
                                        
                                        <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0', my: 3 }} />

                                        <Stack spacing={1.5}>
                                            <Button 
                                                fullWidth variant="contained" 
                                                startIcon={<CalendarClock size={18} />} 
                                                onClick={() => handleOpenAgenda(medico)}
                                                sx={{ bgcolor: '#0F172A', fontWeight: 800, borderRadius: '12px', textTransform: 'none', color: '#FFFFFF', py: 1.2, boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)', '&:hover': { bgcolor: '#1E293B' } }}
                                            >
                                                Ver Agenda
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* MODAL ANTIGO: ADICIONAR PROFISSIONAL */}
                <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'center' }, textAlign: { xs: 'center', sm: 'left' }, gap: 2, pb: 1 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={900} color="#0F172A">Adicionar à equipe clínica</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Encontre profissionais na sua cidade.</Typography>
                        </Box>
                        <IconButton onClick={handleCloseModal} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                            <X size={20} color="#64748B" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ pb: 3 }}>
                        <TextField 
                            fullWidth 
                            placeholder="Procurar por nome ou especialidade..."
                            variant="outlined"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            sx={{ mt: 1, mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC' } }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search size={20} color="#94A3B8" /></InputAdornment>
                            }}
                        />

                        {buscandoProximos ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={32} sx={{ color: '#32B5FE' }} /></Box>
                        ) : profissionaisDisponiveis.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                Nenhum profissional disponível encontrado na sua região.
                            </Typography>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {profissionaisFiltrados.map((prof) => (
                                    <ListItem 
                                        key={prof.id}
                                        sx={{ 
                                            border: '1px solid #E2E8F0', borderRadius: '16px', mb: 1.5, p: 2,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={prof.foto_perfil} sx={{ width: 50, height: 50, bgcolor: '#F1F5F9', color: '#32B5FE', fontWeight: 800 }}>
                                                {prof.nome[0].toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={800} color="#0F172A">{prof.nome}</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{prof.especialidade || 'Clínico Geral'}</Typography>
                                            </Box>
                                        </Box>
                                        <Button 
                                            variant="contained" 
                                            endIcon={conviteLoading === prof.id ? <CircularProgress size={14} color="inherit" /> : <Send size={16} />}
                                            disabled={conviteLoading === prof.id}
                                            onClick={() => handleEnviarConvite(prof.id)}
                                            sx={{ bgcolor: '#0F172A', color: 'white', borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2, '&:hover': { bgcolor: '#32B5FE' } }}
                                        >
                                            {conviteLoading === prof.id ? 'A Enviar...' : 'Convidar'}
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </DialogContent>
                </Dialog>

                {/* NOVO MODAL: VER AGENDA DO MÉDICO COM PAGINAÇÃO */}
                <Dialog 
                    open={modalAgendaOpen} 
                    onClose={handleCloseAgenda}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '24px', p: { xs: 2, md: 4 }, minHeight: '60vh' } }} 
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar src={medicoSelecionado?.foto_perfil} sx={{ width: 64, height: 64, bgcolor: '#F1F5F9', color: '#32B5FE', fontSize: '1.5rem', fontWeight: 800 }}>
                                {medicoSelecionado?.nome?.[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={900} color="#0F172A" lineHeight={1.2}>
                                    Agenda: {medicoSelecionado?.nome}
                                </Typography>
                                <Typography variant="body1" color="#32B5FE" fontWeight={700} sx={{ mt: 0.5 }}>
                                    {medicoSelecionado?.especialidade}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={handleCloseAgenda} sx={{ bgcolor: '#F8FAFC', width: 40, height: 40, '&:hover': { bgcolor: '#F1F5F9' } }}>
                            <X size={24} color="#64748B" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 1, pb: 2 }}>
                        
                        {/* --- NAVEGAÇÃO DE DIAS --- */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, bgcolor: '#F8FAFC', p: 2, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <IconButton 
                                onClick={() => alterarDia(-1)} 
                                sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#F1F5F9' } }}
                            >
                                <ChevronLeft size={20} color="#0F172A" />
                            </IconButton>

                            <TextField
                                fullWidth
                                type="date"
                                value={dataFiltro}
                                onChange={handleDataChange}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF', transition: 'all 0.2s', '&:hover fieldset': { borderColor: '#32B5FE' }, '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' } },
                                    '& input': { textAlign: 'center', fontWeight: 700, color: '#0F172A' }
                                }}
                            />

                            <IconButton 
                                onClick={() => alterarDia(1)} 
                                sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#F1F5F9' } }}
                            >
                                <ChevronRight size={20} color="#0F172A" />
                            </IconButton>
                        </Box>

                        {/* --- LISTAGEM DE CONSULTAS --- */}
                        {loadingAgenda ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}>
                                <CircularProgress size={40} sx={{ color: '#32B5FE' }} />
                            </Box>
                        ) : agendaLista.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '2px dashed #E2E8F0' }}>
                                <Calendar size={50} color="#CBD5E1" style={{ margin: '0 auto 16px auto' }} strokeWidth={1.5} />
                                <Typography variant="h6" fontWeight={800} color="#64748B" sx={{ mb: 1 }}>Dia livre!</Typography>
                                <Typography variant="body1" color="#94A3B8">Nenhum paciente agendado para esta data.</Typography>
                            </Box>
                        ) : (
                            <Box>
                                {/* Renderizamos a "agendaPaginada" */}
                                <List sx={{ p: 0 }}>
                                    {agendaPaginada.map((consulta) => (
                                        <ListItem 
                                            key={consulta.id}
                                            sx={{ 
                                                border: '1px solid #F1F5F9', borderRadius: '16px', mb: 2, p: 3, 
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                bgcolor: 'white', '&:hover': { borderColor: '#32B5FE', boxShadow: '0 8px 20px rgba(50, 181, 254, 0.1)', transform: 'translateY(-2px)' },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
                                                    {consulta.nome_paciente}
                                                </Typography>
                                                <Typography variant="body1" color="#64748B" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}>
                                                    <CalendarClock size={16} /> Horário: <strong style={{ color: '#0F172A' }}>{consulta.horario.substring(0, 5)}</strong>
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                                <Chip 
                                                    label={consulta.status.toUpperCase()} 
                                                    sx={{ 
                                                        fontWeight: 800, fontSize: '0.75rem', height: 28, px: 1,
                                                        bgcolor: getStatusStyle(consulta.status).bgcolor,
                                                        color: getStatusStyle(consulta.status).color,
                                                        border: '1px solid', 
                                                        borderColor: getStatusStyle(consulta.status).borderColor
                                                    }} 
                                                />
                                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: '6px' }}>
                                                    {consulta.tipo_agendamento || 'Consulta'}
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>

                                {/* --- PAGINAÇÃO (Só aparece se tiver mais de 1 página) --- */}
                                {totalPaginas > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pt: 2, borderTop: '1px dashed #E2E8F0' }}>
                                        <Pagination 
                                            count={totalPaginas} 
                                            page={paginaAtual} 
                                            onChange={(e, value) => setPaginaAtual(value)} 
                                            color="primary" 
                                            shape="rounded"
                                            sx={{ 
                                                '& .MuiPaginationItem-root': { fontWeight: 800, color: '#64748B' },
                                                '& .Mui-selected': { bgcolor: '#32B5FE !important', color: 'white' }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

            </Box>
        </Fade>
    );
};

export default MedicosUnidade;