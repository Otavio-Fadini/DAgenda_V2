import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, MenuItem, TextField, Button, Stepper, Step, 
    StepLabel, Avatar, CardActionArea, Divider, FormControlLabel, Switch, 
    Chip, Stack, CircularProgress, InputBase, alpha, IconButton, Fade, Zoom
} from '@mui/material';
import { 
    Search, MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, 
    Building2, User, Clock, Car, LocateFixed, Calendar as CalendarIcon,
    ArrowRight, CreditCard, QrCode, Lock
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

// MAPA REAL
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção de ícone do marcador
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
    return null;
};

const NovoAgendamento = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([]);
    const [clinicas, setClinicas] = useState([]);
    const [mapCenter, setMapCenter] = useState([-22.4331, -47.3581]);

    const [busca, setBusca] = useState('');
    const [apenasConvenio, setApenasConvenio] = useState(false);
    const [metodoPagamento, setMetodoPagamento] = useState('pix');

    const [agendamento, setAgendamento] = useState({ 
        id_profissional: '', nome_medico: '', valor_consulta: '', id_clinica: '', nome_clinica: '', data_agendamento: '', horario: '' 
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get('/agendamentos/profissionais');
                setProfissionais(res.data);
                setProfissionaisFiltrados(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        const filtered = profissionais.filter(p => {
            const matchTexto = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                               p.especialidade.toLowerCase().includes(busca.toLowerCase());
            const matchConvenio = apenasConvenio ? Number(p.atende_convenio) === 1 : true;
            return matchTexto && matchConvenio;
        });
        setProfissionaisFiltrados(filtered);
    }, [busca, apenasConvenio, profissionais]);

    const selectMedico = async (id, nome, valor) => {
        setAgendamento({ ...agendamento, id_profissional: id, nome_medico: nome, valor_consulta: valor });
        try {
            const res = await api.get(`/agendamentos/vinculos/clinicas/${id}`);
            setClinicas(res.data);
            setActiveStep(1);
        } catch (err) { console.error(err); }
    };

    const processarPagamentoEAgendar = async () => {
        setLoading(true);
        try {
            const response = await api.post('/agendamentos/agendar', {
                id_profissional: agendamento.id_profissional,
                id_clinica: agendamento.id_clinica,
                data_agendamento: agendamento.data_agendamento,
                horario: agendamento.horario,
                metodo_pagamento: metodoPagamento,
                valor_consulta: agendamento.valor_consulta,
                nome_medico: agendamento.nome_medico
            });

            if (response.data && response.data.init_point) {
                window.location.href = response.data.init_point;
            } else {
                navigate('/dashboard/meus-agendamentos');
            }
        } catch (err) { 
            alert("Erro ao processar. Verifique sua conexão."); 
        } finally {
            setLoading(false);
        }
    };

    // Estilo Moderno para Inputs (Mesmo padrão do Cadastro/Login)
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
            
            {/* TOP BAR MINIMALISTA */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFF', borderBottom: '1px solid #F1F5F9', zIndex: 10 }}>
                <Stepper activeStep={activeStep} sx={{ width: '100%', maxWidth: 800, '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.9rem', color: '#64748B' }, '& .MuiStepLabel-label.Mui-active': { color: '#0F172A', fontWeight: 900 } }}>
                    {['Especialista', 'Localização', 'Agendamento', 'Pagamento'].map(label => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2, borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#E2E8F0', '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' } }}>  
                    Cancelar
                </Button>
            </Box>

            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                
                {/* PASSO 0: GRID DE PROFISSIONAIS MODERNO */}
                {activeStep === 0 && (
                    <Fade in={activeStep === 0}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 3, md: 6 } }}>
                            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                                <Box sx={{ mb: 5 }}>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1.5px' }}>Encontre seu especialista</Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>Selecione o profissional ideal para o seu atendimento.</Typography>
                                </Box>

                                {/* FILTRO HIGH-TECH */}
                                <Paper elevation={0} sx={{ 
                                    p: 1.5, mb: 6, borderRadius: '20px', display: 'flex', alignItems: 'center', 
                                    border: '1px solid #F1F5F9', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Box sx={{ flex: 2, px: 2 }}>
                                        <Stack direction="row" spacing={2} sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '14px', display: 'flex', alignItems: 'center' }}>
                                            <Search size={22} color="#32B5FE" />
                                            <InputBase 
                                                fullWidth 
                                                placeholder="Busque por nome ou especialidade..." 
                                                value={busca} 
                                                onChange={e => setBusca(e.target.value)} 
                                                sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#0F172A' }} 
                                            />
                                        </Stack>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ height: 40, mx: 2, borderColor: '#F1F5F9' }} />
                                    <Box sx={{ flex: 1, px: 2 }}>
                                        <FormControlLabel 
                                            control={<Switch checked={apenasConvenio} onChange={e => setApenasConvenio(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }} />} 
                                            label={<Typography variant="subtitle2" fontWeight={800} color="#64748B">ACEITA CONVÊNIO</Typography>} 
                                        />
                                    </Box>
                                </Paper>

                                <Grid container spacing={4}>
                                    {loading ? (
                                        <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}><CircularProgress sx={{ color: '#32B5FE' }} /></Box>
                                    ) : (
                                        profissionaisFiltrados.map(prof => (
                                            <Grid item xs={12} sm={6} lg={4} key={prof.id}>
                                                <Zoom in={true}>
                                                    <Paper elevation={0} sx={{ 
                                                        borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', 
                                                        transition: 'all 0.3s ease', bgcolor: '#FFFFFF',
                                                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                                        '&:hover': { transform: 'translateY(-6px)', borderColor: '#32B5FE', boxShadow: '0 20px 40px -10px rgba(50, 181, 254, 0.15)'} 
                                                    }}>
                                                        <CardActionArea onClick={() => selectMedico(prof.id, prof.nome, prof.valor_consulta)} sx={{ p: 4 }}>
                                                            <Stack spacing={3}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                    <Avatar src={prof.foto_perfil} sx={{ width: 90, height: 90, borderRadius: '24px', border: '4px solid #F8FAFC', color: '#64748B', bgcolor: '#E2E8F0', fontSize: '2rem', fontWeight: 800 }}>{prof.nome[0]}</Avatar>
                                                                    <Chip label="Verificado" size="small" icon={<ShieldCheck size={14} color="white" />} sx={{ mt: -1.5, zIndex: 2, bgcolor: '#0F172A', color: '#FFF', fontWeight: 800, fontSize: '0.65rem', border: '2px solid #FFF' }} />
                                                                </Box>
                                                                <Box textAlign="center">
                                                                    <Typography variant="h5" fontWeight={900} color="#0F172A">{prof.nome}</Typography>
                                                                    <Typography variant="subtitle2" color="#32B5FE" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1, mt: 0.5 }}>{prof.especialidade}</Typography>
                                                                </Box>
                                                                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                                                    <Star size={16} fill="#FACC15" color="#FACC15" />
                                                                    <Typography variant="body2" fontWeight={800} color="#0F172A">4.9</Typography>
                                                                    <Typography variant="body2" color="#94A3B8" fontWeight={600}>(120 avaliações)</Typography>
                                                                </Stack>
                                                                <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0' }} />
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Box>
                                                                        <Typography variant="caption" color="#94A3B8" fontWeight={800} letterSpacing="0.5px">VALOR DA SESSÃO</Typography>
                                                                        <Typography variant="h5" fontWeight={900} color="#10B981">R$ {prof.valor_consulta || '0,00'}</Typography>
                                                                    </Box>
                                                                    <IconButton sx={{ bgcolor: '#F8FAFC', color: '#0F172A', transition: 'all 0.2s', '&:hover': { bgcolor: '#32B5FE', color: '#FFF', transform: 'translateX(4px)' } }}>
                                                                        <ChevronRight />
                                                                    </IconButton>
                                                                </Box>
                                                            </Stack>
                                                        </CardActionArea>
                                                    </Paper>
                                                </Zoom>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            </Box>
                        </Box>
                    </Fade>
                )}

                {/* PASSO 1: LOCALIZAÇÃO */}
                {activeStep === 1 && (
                    <Box sx={{ display: 'flex', height: '100%' }}>
                        <Box sx={{ width: 440, borderRight: '1px solid #F1F5F9', bgcolor: '#FFF', display: 'flex', flexDirection: 'column', zIndex: 5, boxShadow: '20px 0 40px -20px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.5px' }}>Onde agendar?</Typography>
                                <Typography variant="body2" color="#64748B" fontWeight={600}>Unidades que atendem com <Box component="span" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Box></Typography>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {clinicas.map((c, i) => {
                                    const lat = c.latitude ? parseFloat(c.latitude) : -22.4331 + (i * 0.01);
                                    const lng = c.longitude ? parseFloat(c.longitude) : -47.3581 + (i * 0.01);

                                    return (
                                        <CardActionArea 
                                            key={c.id} 
                                            onMouseEnter={() => setMapCenter([lat, lng])}
                                            onClick={() => { setAgendamento({...agendamento, id_clinica: c.id, nome_clinica: c.nome_fantasia}); setActiveStep(2); }}
                                            sx={{ p: 4, borderBottom: '1px solid #F8FAFC', transition: '0.2s', '&:hover': { bgcolor: alpha('#32B5FE', 0.04), pl: 5 } }}
                                        >
                                            <Stack direction="row" spacing={3} alignItems="flex-start">
                                                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', color: '#0F172A', display: 'flex', border: '1px solid #E2E8F0' }}><Building2 size={28} strokeWidth={1.5} /></Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" fontWeight={800} color="#0F172A">{c.nome_fantasia}</Typography>
                                                    <Typography variant="body2" color="#64748B" fontWeight={600} sx={{ mb: 2, mt: 0.5 }}>{c.endereco || 'Centro • Araras, SP'}</Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <Chip label="2.4 km" size="small" icon={<LocateFixed size={12}/>} sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '8px' }} />
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#10B981', bgcolor: '#ECFDF5', px: 1, borderRadius: '8px' }}>
                                                            <Car size={14} /><Typography variant="caption" fontWeight={800}>Vagas</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </CardActionArea>
                                    );
                                })}
                            </Box>
                            <Box sx={{ p: 3, borderTop: '1px solid #F1F5F9' }}>
                                <Button fullWidth startIcon={<ChevronLeft />} onClick={() => setActiveStep(0)} sx={{ fontWeight: 800, color: '#64748B', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#F1F5F9' } }}>Trocar Profissional</Button>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, zIndex: 0 }}>
                            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                <RecenterMap center={mapCenter} />
                                {clinicas.map((c, i) => {
                                    const lat = c.latitude ? parseFloat(c.latitude) : -22.4331 + (i * 0.01);
                                    const lng = c.longitude ? parseFloat(c.longitude) : -47.3581 + (i * 0.01);
                                    return (
                                        <Marker key={i} position={[lat, lng]}>
                                            <Popup>
                                                <Box sx={{ p: 1, textAlign: 'center' }}>
                                                    <Typography variant="subtitle2" fontWeight={900} color="#0F172A">{c.nome_fantasia}</Typography>
                                                    <Button fullWidth size="small" variant="contained" sx={{ mt: 1.5, bgcolor: '#32B5FE', fontWeight: 800, borderRadius: '8px', textTransform: 'none', boxShadow: 'none' }} onClick={() => { setAgendamento({...agendamento, id_clinica: c.id, nome_clinica: c.nome_fantasia}); setActiveStep(2); }}>Escolher Unidade</Button>
                                                </Box>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </Box>
                    </Box>
                )}

                {/* PASSO 2: CONFIRMAÇÃO (REVISÃO DE DADOS E DATA) */}
                {activeStep === 2 && (
                    <Fade in={activeStep === 2}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={0} sx={{ maxWidth: 1000, width: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, border: '1px solid #F1F5F9', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}>
                                
                                {/* Lado Escuro (Resumo) */}
                                <Box sx={{ flex: 1, p: 6, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFF', position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(50, 181, 254, 0.15) 0%, rgba(0,0,0,0) 70%)' }} />
                                    
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Typography variant="overline" sx={{ color: '#32B5FE', fontWeight: 900, letterSpacing: 2 }}>PASSO 3</Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ mb: 6, mt: 1, color: '#FFFFFF', letterSpacing: '-1px' }}>Defina o horário</Typography>
                                        
                                        <Stack spacing={4}>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56, borderRadius: '16px' }}><User color="#32B5FE" /></Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px' }}>ESPECIALISTA</Typography>
                                                    <Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_medico}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56, borderRadius: '16px' }}><Building2 color="#32B5FE" /></Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px' }}>UNIDADE</Typography>
                                                    <Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_clinica}</Typography>
                                                </Box>
                                            </Box>
                                        </Stack>

                                        <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(1)} sx={{ mt: 10, color: '#32B5FE', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: 'rgba(50,181,254,0.1)' } }}>Alterar Unidade</Button>
                                    </Box>
                                </Box>

                                {/* Lado Claro (Formulário) */}
                                <Box sx={{ flex: 1.2, p: { xs: 4, md: 6 }, bgcolor: '#FFF' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4, letterSpacing: '-0.5px' }}>Escolha a data e o horário</Typography>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.5px' }}>DATA DA CONSULTA</Typography>
                                            <TextField fullWidth type="date" variant="outlined" sx={modernInputStyle} onChange={e => setAgendamento({...agendamento, data_agendamento: e.target.value})} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.5px' }}>HORÁRIO DISPONÍVEL</Typography>
                                            <TextField fullWidth select variant="outlined" sx={modernInputStyle} value={agendamento.horario} onChange={e => setAgendamento({...agendamento, horario: e.target.value})}>
                                                {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map(h => <MenuItem key={h} value={h} sx={{ fontWeight: 700, color: '#0F172A' }}>{h}</MenuItem>)}
                                            </TextField>
                                        </Box>
                                        
                                        <Box sx={{ pt: 2 }}>
                                            <Button 
                                                fullWidth variant="contained" size="large" 
                                                onClick={() => setActiveStep(3)}
                                                disabled={!agendamento.data_agendamento || !agendamento.horario}
                                                endIcon={<ArrowRight />}
                                                sx={{ 
                                                    py: 2, borderRadius: '12px', color: '#FFFFFF', bgcolor: '#0F172A', fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)',
                                                    transition: 'all 0.3s',
                                                    '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' },
                                                    '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
                                                }}
                                            >
                                                Avançar para Pagamento
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                )}

                {/* PASSO 3: CHECKOUT DE PAGAMENTO */}
                {activeStep === 3 && (
                    <Fade in={activeStep === 3}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={0} sx={{ maxWidth: 1000, width: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, border: '1px solid #F1F5F9', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}>
                                
                                {/* Resumo do Pedido */}
                                <Box sx={{ flex: 1, p: 6, bgcolor: '#F8FAFC', borderRight: '1px solid #F1F5F9' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4, letterSpacing: '-0.5px' }}>Resumo do Pedido</Typography>
                                    
                                    <Stack spacing={3} sx={{ mb: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="#64748B" fontWeight={700}>Serviço</Typography>
                                            <Typography variant="body1" fontWeight={800} color="#0F172A">Consulta Médica</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="#64748B" fontWeight={700}>Especialista</Typography>
                                            <Typography variant="body1" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="#64748B" fontWeight={700}>Data e Hora</Typography>
                                            <Typography variant="body1" fontWeight={800} color="#0F172A">{agendamento.data_agendamento.split('-').reverse().join('/')} às {agendamento.horario}</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#CBD5E1', mb: 4 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" color="#64748B" fontWeight={800}>Total a pagar</Typography>
                                        <Typography variant="h4" fontWeight={900} color="#10B981" sx={{ letterSpacing: '-1px' }}>R$ {agendamento.valor_consulta || '0,00'}</Typography>
                                    </Box>

                                    <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(2)} sx={{ mt: 6, color: '#64748B', fontWeight: 800, textTransform: 'none', borderRadius: '10px', '&:hover': { bgcolor: '#E2E8F0' } }}>Voltar e editar horário</Button>
                                </Box>

                                {/* Métodos de Pagamento */}
                                <Box sx={{ flex: 1.3, p: 6, bgcolor: '#FFF' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                                        <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '8px', display: 'flex' }}><Lock size={16} color="#10B981" /></Box>
                                        <Typography variant="caption" fontWeight={900} color="#10B981" sx={{ letterSpacing: '1px' }}>CHECKOUT SEGURO</Typography>
                                    </Box>
                                    
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4, letterSpacing: '-0.5px' }}>Como você prefere pagar?</Typography>

                                    <Grid container spacing={2} sx={{ mb: 5 }}>
                                        <Grid item xs={6}>
                                            <Paper 
                                                elevation={0}
                                                onClick={() => setMetodoPagamento('pix')}
                                                sx={{ 
                                                    p: 3, borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                                    border: metodoPagamento === 'pix' ? '2px solid #009EE3' : '2px solid #F1F5F9', 
                                                    bgcolor: metodoPagamento === 'pix' ? alpha('#009EE3', 0.05) : '#FFFFFF', 
                                                    '&:hover': { borderColor: '#009EE3' }
                                                }}
                                            >
                                                <QrCode size={32} color={metodoPagamento === 'pix' ? '#009EE3' : '#64748B'} style={{ margin: '0 auto 12px' }} />
                                                <Typography variant="subtitle2" fontWeight={800} color={metodoPagamento === 'pix' ? '#009EE3' : '#0F172A'}>Pix</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Aprovação imediata</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper 
                                                elevation={0}
                                                onClick={() => setMetodoPagamento('cartao')}
                                                sx={{ 
                                                    p: 3, borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                                    border: metodoPagamento === 'cartao' ? '2px solid #009EE3' : '2px solid #F1F5F9', 
                                                    bgcolor: metodoPagamento === 'cartao' ? alpha('#009EE3', 0.05) : '#FFFFFF', 
                                                    '&:hover': { borderColor: '#009EE3' }
                                                }}
                                            >
                                                <CreditCard size={32} color={metodoPagamento === 'cartao' ? '#009EE3' : '#64748B'} style={{ margin: '0 auto 12px' }} />
                                                <Typography variant="subtitle2" fontWeight={800} color={metodoPagamento === 'cartao' ? '#009EE3' : '#0F172A'}>Cartão de Crédito</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Até 12x sem juros</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Botão de Finalização (Estilo Mercado Pago) */}
                                    <Box sx={{ pt: 2 }}>
                                        <Button 
                                            fullWidth variant="contained" size="large" 
                                            onClick={processarPagamentoEAgendar}
                                            sx={{ 
                                                py: 2, borderRadius: '12px', color: '#FFFFFF', bgcolor: '#009EE3', fontWeight: 800, fontSize: '1rem', textTransform: 'none',
                                                boxShadow: '0 10px 20px -10px rgba(0, 158, 227, 0.6)', transition: 'all 0.3s',
                                                '&:hover': { bgcolor: '#008ACA', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(0, 158, 227, 0.8)' } 
                                            }}
                                        >
                                            Pagar com Mercado Pago
                                        </Button>
                                        <Typography variant="caption" textAlign="center" display="block" color="#94A3B8" fontWeight={600} sx={{ mt: 3 }}>
                                            Ambiente seguro criptografado de ponta a ponta.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                )}
            </Box>
        </Box>
    );
};

export default NovoAgendamento;