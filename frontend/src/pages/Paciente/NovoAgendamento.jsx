import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, MenuItem, TextField, 
    Button, Stepper, Step, StepLabel, Avatar, CardActionArea, 
    Divider, FormControlLabel, Switch, Chip, Stack, CircularProgress,
    InputBase, alpha, IconButton
} from '@mui/material';
import { 
    Calendar, User, Building2, Clock, ChevronRight, 
    ChevronLeft, CheckCircle2, Search, DollarSign, MapPin, Star, ShieldCheck,
    LocateFixed, Navigation2, Info, Plus, Minus, Car, Wifi
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NovoAgendamento = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([]);
    const [clinicas, setClinicas] = useState([]);
    
    // Filtros de busca
    const [busca, setBusca] = useState('');
    const [dataFiltro, setDataFiltro] = useState('');
    const [apenasConvenio, setApenasConvenio] = useState(false);

    const [agendamento, setAgendamento] = useState({ 
        id_profissional: '', nome_medico: '', id_clinica: '', nome_clinica: '', data_agendamento: '', horario: '' 
    });

    const steps = ['Especialista', 'Unidade', 'Agendamento'];

    useEffect(() => {
        const carregarMedicos = async () => {
            setLoading(true);
            try {
                const res = await api.get('/agendamentos/profissionais');
                setProfissionais(res.data);
                setProfissionaisFiltrados(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        carregarMedicos();
    }, []);

    // Lógica de Filtro Global
    useEffect(() => {
        const resultado = profissionais.filter(p => {
            const matchTexto = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                               p.especialidade.toLowerCase().includes(busca.toLowerCase());
            
            // Lógica de Convênio (Backend retorna 1 para sim, 0 para não)
            const matchConvenio = apenasConvenio ? Number(p.atende_convenio) === 1 : true;
            
            return matchTexto && matchConvenio;
        });
        setProfissionaisFiltrados(resultado);
    }, [busca, apenasConvenio, profissionais]);

    const selecionarMedico = async (id, nome) => {
        setAgendamento({ ...agendamento, id_profissional: id, nome_medico: nome });
        try {
            const res = await api.get(`/agendamentos/vinculos/clinicas/${id}`);
            setClinicas(res.data);
            setActiveStep(1);
        } catch (err) { console.error(err); }
    };

    const finalizarAgendamento = async () => {
        try {
            await api.post('/agendamentos/agendar', {
                id_profissional: agendamento.id_profissional,
                id_clinica: agendamento.id_clinica,
                data_agendamento: agendamento.data_agendamento,
                horario: agendamento.horario
            });
            navigate('/dashboard/meus-agendamentos');
        } catch (err) { alert("Erro ao agendar."); }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F1F5F9', minHeight: '100vh' }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-2px' }}>
                        DAGENDA<span style={{ color: '#32B5FE' }}>PRO</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={800} sx={{ mt: 1, letterSpacing: 2, textTransform: 'uppercase' }}>
                        Seu portal de saúde inteligente
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} centered sx={{ mb: 8, '& .MuiStepIcon-root.Mui-active': { color: '#32B5FE' } }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 800, fontSize: '0.8rem' } }}>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {/* BARRA DE FILTRO MULTI-ACTION (ESTILO BUSCA INTELIGENTE) */}
                {activeStep === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
                        <Paper elevation={0} sx={{ 
                            display: 'flex', alignItems: 'center', p: '8px', borderRadius: '100px',
                            border: '1px solid', borderColor: alpha('#E2E8F0', 0.8), bgcolor: '#FFFFFF', width: '100%', maxWidth: 1000,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
                        }}>
                            {/* BUSCA POR NOME/ESPEC */}
                            <Box sx={{ flex: 1.5, px: 4, py: 1 }}>
                                <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Especialista</Typography>
                                <InputBase 
                                    fullWidth placeholder="Ex: Dr. Silva ou Cardiologia" 
                                    value={busca} onChange={(e) => setBusca(e.target.value)}
                                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', mt: -0.5 }}
                                />
                            </Box>
                            
                            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 40, alignSelf: 'center', bgcolor: alpha('#E2E8F0', 0.5) }} />

                            {/* BUSCA POR DATA */}
                            <Box sx={{ flex: 1, px: 4, py: 1 }}>
                                <Typography variant="caption" fontWeight={900} color="#32B5FE" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Quando?</Typography>
                                <InputBase 
                                    type="date" fullWidth
                                    value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)}
                                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', mt: -0.5 }}
                                />
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 40, alignSelf: 'center', bgcolor: alpha('#E2E8F0', 0.5) }} />

                            {/* FILTRO CONVÊNIO */}
                            <Box sx={{ flex: 0.8, px: 4, display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={<Switch size="small" checked={apenasConvenio} onChange={(e) => setApenasConvenio(e.target.checked)} color="primary" />}
                                    label={<Typography variant="caption" fontWeight={900}>CONVÊNIO</Typography>}
                                />
                            </Box>

                            <Button 
                                variant="contained" 
                                sx={{ 
                                    minWidth: 56, width: 56, height: 56, borderRadius: '50%', 
                                    bgcolor: '#0F172A', color: '#FFFFFF', boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                                    '&:hover': { bgcolor: '#32B5FE', transform: 'scale(1.05)' }, transition: '0.2s'
                                }}
                            >
                                <Search size={22} />
                            </Button>
                        </Paper>
                    </Box>
                )}

                <Grid container spacing={4}>
                    {/* LISTA DE PROFISSIONAIS */}
                    {activeStep === 0 && (
                        loading ? <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}><CircularProgress /></Box> :
                        profissionaisFiltrados.map(prof => (
                            <Grid item xs={12} md={4} key={prof.id}>
                                <Paper sx={{ 
                                    borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF',
                                    transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                                    '&:hover': { transform: 'translateY(-12px)', boxShadow: '0 40px 60px rgba(15, 23, 42, 0.1)', borderColor: '#32B5FE' } 
                                }}>
                                    <CardActionArea onClick={() => selecionarMedico(prof.id, prof.nome)} sx={{ p: 0 }}>
                                        <Box sx={{ p: 4 }}>
                                            <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                                <Avatar src={prof.foto_perfil} sx={{ width: 75, height: 75, borderRadius: 3, border: '4px solid #F8FAFC' }}>{prof.nome[0]}</Avatar>
                                                <Box>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="h6" fontWeight={900} color="#0F172A">{prof.nome}</Typography>
                                                        <ShieldCheck size={18} color="#32B5FE" fill={alpha('#32B5FE', 0.1)} />
                                                    </Stack>
                                                    <Typography variant="body2" color="#32B5FE" fontWeight={800}>{prof.especialidade.toUpperCase()}</Typography>
                                                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="#FACC15" color="#FACC15" />)}
                                                        <Typography variant="caption" fontWeight={900} sx={{ ml: 1, color: '#64748B' }}>4.9</Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </Box>
                                        <Box sx={{ bgcolor: alpha('#F1F5F9', 0.5), p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={900}>SESSÃO</Typography>
                                                <Typography variant="h5" fontWeight={900} color="#0F172A">R$ {prof.valor_consulta || '0,00'}</Typography>
                                            </Box>
                                            <Button variant="contained" sx={{ borderRadius: 1, color: '#FFFFFF', bgcolor: '#0F172A', px: 3, fontWeight: 900, textTransform: 'none', '&:hover': { bgcolor: '#32B5FE' } }}>Ver Horários</Button>
                                        </Box>
                                    </CardActionArea>
                                </Paper>
                            </Grid>
                        ))
                    )}

                    {/* LOCALIZAÇÃO COM MAPA HIGH-TECH */}
                    {/* PASSO 1: UNIDADES - SPLIT VIEW REFINADA (LISTA + MAPA) */}
                    {activeStep === 1 && (
                        <Box sx={{ 
                            mt: 2, 
                            height: 'calc(100vh - 250px)', // Define uma altura fixa baseada na viewport
                            minHeight: '600px',
                            overflow: 'hidden' // Bloqueia a rolagem externa
                        }}>
                            <Grid container sx={{ 
                                borderRadius: 4, 
                                overflow: 'hidden', 
                                border: '1px solid #E2E8F0', 
                                bgcolor: '#FFFFFF', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)',
                                height: '100%' // Ocupa toda a altura do container pai
                            }}>
                                {/* COLUNA DA ESQUERDA: LISTA DE UNIDADES */}
                                <Grid item xs={12} md={5} sx={{ 
                                    borderRight: '1px solid #E2E8F0', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    height: '100%' 
                                }}>
                                    <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                        <Typography variant="h5" fontWeight={900} color="#0F172A">Onde você deseja ir?</Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {clinicas.length} unidades encontradas para {agendamento.nome_medico}
                                        </Typography>
                                    </Box>

                                    {/* AREA DE SCROLL INTERNA (APENAS AQUI ROLA) */}
                                    <Box sx={{ 
                                        flex: 1, 
                                        overflowY: 'auto', 
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' }
                                    }}>
                                        <Stack spacing={0} divider={<Divider />}>
                                            {clinicas.map(clinica => (
                                                <CardActionArea 
                                                    key={clinica.id} 
                                                    onClick={() => { setAgendamento({...agendamento, id_clinica: clinica.id, nome_clinica: clinica.nome_fantasia}); setActiveStep(2); }}
                                                    sx={{ p: 3, transition: '0.2s', '&:hover': { bgcolor: alpha('#32B5FE', 0.04) } }}
                                                >
                                                    <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                                        <Avatar sx={{ bgcolor: '#0F172A', borderRadius: 2, width: 48, height: 48 }}>
                                                            <Building2 size={24} color="#FFFFFF" />
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <Typography variant="subtitle1" fontWeight={900} color="#0F172A">{clinica.nome_fantasia}</Typography>
                                                                <Chip 
                                                                    label="2.4km" 
                                                                    size="small" 
                                                                    sx={{ fontWeight: 900, bgcolor: alpha('#10B981', 0.1), color: '#10B981', borderRadius: 1 }} 
                                                                />
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                                                                Araras, São Paulo • Unidade Centro
                                                            </Typography>
                                                            
                                                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                                                                    <Car size={14} /><Typography variant="caption" fontWeight={800}>Vagas</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                                                                    <Wifi size={14} /><Typography variant="caption" fontWeight={800}>Wi-Fi</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#32B5FE' }}>
                                                                    <Info size={14} /><Typography variant="caption" fontWeight={800}>Ver detalhes</Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </CardActionArea>
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', bgcolor: '#FFFFFF' }}>
                                        <Button 
                                            fullWidth 
                                            startIcon={<ChevronLeft />} 
                                            onClick={() => setActiveStep(0)} 
                                            sx={{ fontWeight: 900, color: '#64748B', textTransform: 'none' }}
                                        >
                                            Voltar para Profissionais
                                        </Button>
                                    </Box>
                                </Grid>

                                {/* COLUNA DA DIREITA: MAPA HIGH-TECH (FIXO) */}
                                <Grid item xs={12} md={7} sx={{ bgcolor: '#0F172A', position: 'relative', overflow: 'hidden', height: '100%' }}>
                                    <Box sx={{ 
                                        position: 'absolute', inset: 0, opacity: 0.1, 
                                        backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', 
                                        backgroundSize: '30px 30px' 
                                    }} />
                                    
                                    <Box className="radar-circle" sx={{ 
                                        position: 'absolute', top: '50%', left: '50%', 
                                        transform: 'translate(-50%, -50%)', 
                                        width: 350, height: 350, borderRadius: '50%', 
                                        border: '1px solid rgba(50, 181, 254, 0.2)', 
                                        animation: 'pulse 3s infinite' 
                                    }} />

                                    <Paper sx={{ 
                                        zIndex: 2, position: 'absolute', top: 20, left: 20, 
                                        bgcolor: alpha('#FFFFFF', 0.9), p: 1.5, borderRadius: 2, 
                                        backdropFilter: 'blur(10px)', border: '1px solid #E2E8F0'
                                    }}>
                                        <Typography variant="caption" fontWeight={900} color="#0F172A" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocateFixed size={16} color="#32B5FE" /> LOCALIZAÇÃO ATIVA: ARARAS/SP
                                        </Typography>
                                    </Paper>

                                    {clinicas.map((c, i) => (
                                        <Box key={i} sx={{ position: 'absolute', top: `${30 + (i * 15)}%`, left: `${25 + (i * 20)}%`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                            <Paper elevation={4} sx={{ px: 1.5, py: 0.5, borderRadius: 10, bgcolor: '#FFFFFF', mb: 1, border: '2px solid #32B5FE' }}>
                                                <Typography variant="caption" fontWeight={900} color="#0F172A">{c.nome_fantasia}</Typography>
                                            </Paper>
                                            <MapPin size={38} fill="#EF4444" color="#FFFFFF" />
                                        </Box>
                                    ))}

                                    <Stack sx={{ position: 'absolute', right: 20, bottom: 20, zIndex: 2 }} spacing={1}>
                                        <Paper sx={{ p: 1, borderRadius: 2, bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <IconButton size="small"><Plus size={20} /></IconButton>
                                            <Divider />
                                            <IconButton size="small"><Minus size={20} /></IconButton>
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* CONFIRMAÇÃO FINAL */}
                    {activeStep === 2 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: { xs: 4, md: 8 }, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.12)' }}>
                                <Grid container spacing={8}>
                                    <Grid item xs={12} md={5}>
                                        <Typography variant="overline" sx={{ color: '#32B5FE', fontWeight: 900, letterSpacing: 2 }}>FINALIZAÇÃO</Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ mb: 5, color: '#0F172A' }}>Quase lá!</Typography>
                                        
                                        <Stack spacing={4}>
                                            <Paper sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                                <Stack direction="row" spacing={3}>
                                                    <Avatar sx={{ bgcolor: '#0F172A', width: 60, height: 60, borderRadius: 2 }}>{agendamento.nome_medico[0]}</Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={900}>PROFISSIONAL</Typography>
                                                        <Typography variant="h6" fontWeight={900}>{agendamento.nome_medico}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                            <Paper sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                                <Stack direction="row" spacing={3}>
                                                    <Box sx={{ p: 2, bgcolor: '#32B5FE', color: '#FFFFFF', borderRadius: 2 }}><Building2 size={24}/></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={900}>UNIDADE ESCOLHIDA</Typography>
                                                        <Typography variant="h6" fontWeight={900}>{agendamento.nome_clinica}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Stack>
                                        <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(1)} sx={{ mt: 5, fontWeight: 900, color: '#64748B' }}>Mudar Unidade</Button>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={7}>
                                        <Box sx={{ p: 5, bgcolor: '#F1F5F9', borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                                            <Typography variant="h6" fontWeight={900} sx={{ mb: 4, textAlign: 'center' }}>Confirme o agendamento</Typography>
                                            <Stack spacing={4}>
                                                <TextField 
                                                    fullWidth type="date" variant="standard"
                                                    InputProps={{ disableUnderline: true, sx: { borderRadius: 5, bgcolor: '#FFFFFF', p: 3, fontWeight: 800, fontSize: '1.1rem' } }}
                                                    onChange={(e) => setAgendamento({...agendamento, data_agendamento: e.target.value})}
                                                />
                                                <TextField 
                                                    fullWidth select variant="standard" label="Horário"
                                                    InputProps={{ disableUnderline: true, sx: { borderRadius: 5, bgcolor: '#FFFFFF', p: 3, fontWeight: 800, fontSize: '1.1rem' } }}
                                                    onChange={(e) => setAgendamento({...agendamento, horario: e.target.value})}
                                                >
                                                    {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map(h => <MenuItem key={h} value={h} sx={{ fontWeight: 800 }}>{h}</MenuItem>)}
                                                </TextField>
                                                <Button
                                                    fullWidth variant="contained" size="large" 
                                                    onClick={finalizarAgendamento}
                                                    disabled={!agendamento.data_agendamento || !agendamento.horario}
                                                    sx={{ borderRadius: 2, py: 3, color: '#FFFFFF', bgcolor: '#0F172A', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)', '&:hover': { bgcolor: '#32B5FE' } }}
                                                >
                                                    Confirmar e Agendar
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
            
            {/* ESTILO DE ANIMAÇÃO DO RADAR */}
            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                `}
            </style>
        </Box>
    );
};

export default NovoAgendamento;