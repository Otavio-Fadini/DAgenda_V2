import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, MenuItem, TextField, Button, Stepper, Step, 
    StepLabel, Avatar, CardActionArea, Divider, FormControlLabel, Switch, 
    Chip, Stack, CircularProgress, InputBase, alpha, IconButton, Fade, Zoom
} from '@mui/material';
import { 
    Search, MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, 
    Building2, User, Clock, Car, Wifi, LocateFixed, Calendar as CalendarIcon,
    CheckCircle2, ArrowRight, Sparkles, Map as MapIcon, CreditCard, QrCode, Lock
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
    const [dataFiltro, setDataFiltro] = useState('');
    const [apenasConvenio, setApenasConvenio] = useState(false);
    
    // Controle do tipo de pagamento na UI
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

            // O front-end recebe o link e faz a mágica acontecer
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

    return (

        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
            
            {/* TOP BAR MINIMALISTA */}
            <Box sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFF', borderBottom: '1px solid #E2E8F0', zIndex: 10 }}>
                <Stepper activeStep={activeStep} sx={{ width: 1400, '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '1rem' } }}>
                    {['Especialista', 'Localização', 'Confirmar', 'Pagamento'].map(label => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, color: '#FFFFFF', bgcolor: '#0F172A', '&:hover': { bgcolor: '#32B5FE' } }}>  
                    Cancelar
                </Button>
            </Box>

            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                
                {/* PASSO 0: GRID DE PROFISSIONAIS MODERNO */}
                {activeStep === 0 && (
                    <Fade in={activeStep === 0}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: 6 }}>
                            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                                <Box sx={{ mb: 6 }}>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-2px' }}>Bem-vindo ao Agendamento</Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>Escolha um especialista para iniciar seu atendimento.</Typography>
                                </Box>

                                {/* FILTRO HIGH-TECH */}
                                <Paper elevation={5} sx={{ 
                                    p: 1.5, mb: 8, borderRadius: 2, display: 'flex', alignItems: 'center', 
                                    border: '1px solid #E2E8F0', bgcolor: alpha('#FFF', 0.8), backdropFilter: 'blur(10px)'
                                }}>
                                    <Box sx={{ flex: 2, px: 3 }}>
                                        <Stack 
                                            direction="row" 
                                            spacing={2} 
                                            sx={{ 
                                            bgcolor: '#eceef1', 
                                            p: 1.5, 
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Search size={22} color="#32B5FE" />
                                            </Box>
                                            
                                            <InputBase 
                                            fullWidth 
                                            placeholder="Procure por nome ou especialidade..." 
                                            value={busca} 
                                            onChange={e => setBusca(e.target.value)} 
                                            sx={{ 
                                                fontWeight: 600, 
                                                fontSize: '1.1rem',
                                                '& input': {
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center'
                                                }
                                            }} 
                                            />
                                        </Stack>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ height: 40, mx: 2 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <FormControlLabel 
                                            control={<Switch checked={apenasConvenio} onChange={e => setApenasConvenio(e.target.checked)} />} 
                                            label={<Typography variant="subtitle2" fontWeight={800} color="#64748B">CONVÊNIO</Typography>} 
                                        />
                                    </Box>
                                    <Button variant="contained" sx={{ borderRadius: 1, px: 6, py: 1.5, color: '#FFFFFF', bgcolor: '#0F172A', fontWeight: 900, fontSize: '0.9rem', '&:hover': { bgcolor: '#32B5FE' } }}>Buscar</Button>
                                </Paper>

                                <Grid container spacing={4}>
                                    {loading ? (
                                        <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}><CircularProgress color="primary" /></Box>
                                    ) : (
                                        profissionaisFiltrados.map(prof => (
                                            <Grid item xs={12} md={4} key={prof.id}>
                                                <Zoom in={true}>
                                                    <Paper elevation={5} sx={{ 
                                                        borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                                                        '&:hover': { transform: 'translateY(-12px)', borderColor: '#32B5FE'}, bgcolor: '#FFFFFF' 
                                                    }}>
                                                        <CardActionArea onClick={() => selectMedico(prof.id, prof.nome, prof.valor_consulta)} sx={{ p: 4 }}>
                                                            <Stack spacing={3}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                    <Avatar src={prof.foto_perfil} sx={{ width: 90, height: 90, borderRadius: 2, border: '4px solid #F8FAFC' }}>{prof.nome[0]}</Avatar>
                                                                    <Chip label="Verificado" size="small" icon={<ShieldCheck size={14} color="white" />} sx={{ bgcolor: '#0F172A', color: '#FFF', fontWeight: 800, fontSize: '0.65rem' }} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="h5" fontWeight={900} color="#0F172A">{prof.nome}</Typography>
                                                                    <Typography variant="subtitle1" color="#32B5FE" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{prof.especialidade}</Typography>
                                                                </Box>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Star size={16} fill="#FACC15" color="#FACC15" />
                                                                    <Typography variant="body2" fontWeight={800} color="#0F172A">4.9</Typography>
                                                                    <Typography variant="body2" color="text.secondary">(120 avaliações)</Typography>
                                                                </Stack>
                                                                <Divider />
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary" fontWeight={800}>SESSÃO</Typography>
                                                                        <Typography variant="h5" fontWeight={900} color="#10B981">R$ {prof.valor_consulta || '0,00'}</Typography>
                                                                    </Box>
                                                                    <IconButton sx={{ bgcolor: '#F1F5F9', color: '#0F172A', '&:hover': { bgcolor: '#32B5FE', color: '#FFF' } }}>
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

                {/* PASSO 1: LOCALIZAÇÃO - SPLIT VIEW REFINADA */}
                {activeStep === 1 && (
                    <Box sx={{ display: 'flex', height: '100%' }}>
                        {/* LISTA LATERAL ESTILO APP */}
                        <Box sx={{ width: 440, borderRight: '1px solid #E2E8F0', bgcolor: '#FFF', display: 'flex', flexDirection: 'column', zIndex: 5 }}>
                            <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 1 }}>Onde agendar?</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>Unidades para atendimento com {agendamento.nome_medico}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {clinicas.map((c, i) => {
                                    // Tenta usar latitude/longitude do BD, senao usa um fallback visual para não quebrar
                                    const lat = c.latitude ? parseFloat(c.latitude) : -22.4331 + (i * 0.01);
                                    const lng = c.longitude ? parseFloat(c.longitude) : -47.3581 + (i * 0.01);

                                    return (
                                        <CardActionArea 
                                            key={c.id} 
                                            onMouseEnter={() => setMapCenter([lat, lng])}
                                            onClick={() => { setAgendamento({...agendamento, id_clinica: c.id, nome_clinica: c.nome_fantasia}); setActiveStep(2); }}
                                            sx={{ p: 4, borderBottom: '1px solid #F1F5F9', transition: '0.2s', '&:hover': { bgcolor: alpha('#32B5FE', 0.04) } }}
                                        >
                                            <Stack direction="row" spacing={3} alignItems="flex-start">
                                                <Box sx={{ p: 2, bgcolor: '#0F172A', borderRadius: 1, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={30} /></Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" fontWeight={900} color="#0F172A">{c.nome_fantasia}</Typography>
                                                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 2 }}>{c.endereco || 'Centro • Araras, SP'}</Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <Chip label="2.4 km" size="small" icon={<LocateFixed size={12}/>} sx={{ fontWeight: 900, bgcolor: '#F1F5F9' }} />
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#10B981' }}>
                                                            <Car size={16} /><Typography variant="caption" fontWeight={900}>Vagas</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </CardActionArea>
                                    );
                                })}
                            </Box>
                            <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
                                <Button fullWidth startIcon={<ChevronLeft />} onClick={() => setActiveStep(0)} sx={{ fontWeight: 800, color: '#64748B', py: 1.5 }}>Trocar Profissional</Button>
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
                                                    <Typography variant="subtitle2" fontWeight={900}>{c.nome_fantasia}</Typography>
                                                    <Button fullWidth size="small" variant="contained" sx={{ mt: 1, bgcolor: '#0F172A', fontWeight: 900 }} onClick={() => { setAgendamento({...agendamento, id_clinica: c.id, nome_clinica: c.nome_fantasia}); setActiveStep(2); }}>Escolher Unidade</Button>
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
                        <Box sx={{ height: '100%', overflowY: 'auto', p: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={5} sx={{ maxWidth: 900, width: '100%', borderRadius: 2, overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0' }}>
                                <Box sx={{ flex: 1, p: 6, bgcolor: '#0F172A', color: '#FFF' }}>
                                    <Typography variant="overline" sx={{ color: '#32B5FE', fontWeight: 900, letterSpacing: 2 }}>PASSO 3</Typography>
                                    <Typography variant="h4" fontWeight={900} sx={{ mb: 6, mt: 1, color: '#FFFFFF' }}>Defina o horário</Typography>
                                    
                                    <Stack spacing={5}>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Avatar sx={{ bgcolor: alpha('#FFF', 0.1), width: 55, height: 55, borderRadius: 1 }}><User color="#32B5FE" /></Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>ESPECIALISTA</Typography>
                                                <Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_medico}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Avatar sx={{ bgcolor: alpha('#FFF', 0.1), width: 55, height: 55, borderRadius: 1 }}><Building2 color="#32B5FE" /></Avatar>
                                            <Box>
                                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 800 }}>UNIDADE</Typography>
                                                <Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_clinica}</Typography>
                                            </Box>
                                        </Box>
                                    </Stack>

                                    <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(1)} sx={{ mt: 10, color: '#32B5FE', fontWeight: 900, textTransform: 'none' }}>Alterar Unidade</Button>
                                </Box>

                                <Box sx={{ flex: 1.2, p: 6, bgcolor: '#FFF' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4 }}>Escolha a data e o horário</Typography>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: 'block', mb: 1 }}>DATA DA CONSULTA</Typography>
                                            <TextField fullWidth type="date" variant="outlined" InputProps={{ sx: { borderRadius: 2, fontWeight: 700, bgcolor: '#F8FAFC' } }} onChange={e => setAgendamento({...agendamento, data_agendamento: e.target.value})} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: 'block', mb: 1 }}>HORÁRIO DISPONÍVEL</Typography>
                                            <TextField fullWidth select variant="outlined" InputProps={{ sx: { borderRadius: 2, fontWeight: 700, bgcolor: '#F8FAFC' } }} value={agendamento.horario} onChange={e => setAgendamento({...agendamento, horario: e.target.value})}>
                                                {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map(h => <MenuItem key={h} value={h} sx={{ fontWeight: 700 }}>{h}</MenuItem>)}
                                            </TextField>
                                        </Box>
                                        
                                        <Box sx={{ pt: 4 }}>
                                            <Button 
                                                fullWidth variant="contained" size="large" 
                                                onClick={() => setActiveStep(3)} // Avança para o pagamento
                                                disabled={!agendamento.data_agendamento || !agendamento.horario}
                                                endIcon={<ArrowRight />}
                                                sx={{ py: 2.5, borderRadius: 2, color: '#FFFFFF', bgcolor: '#0F172A', fontWeight: 900, fontSize: '1rem', '&:hover': { bgcolor: '#32B5FE' }, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)' }}
                                            >
                                                Ir para Pagamento
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                )}

                {/* PASSO 3: CHECKOUT DE PAGAMENTO (INTEGRAÇÃO MERCADO PAGO) */}
                {activeStep === 3 && (
                    <Fade in={activeStep === 3}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={5} sx={{ maxWidth: 1000, width: '100%', borderRadius: 3, overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0' }}>
                                
                                {/* Resumo do Pedido */}
                                <Box sx={{ flex: 1, p: 6, bgcolor: '#F8FAFC', borderRight: '1px solid #E2E8F0' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4 }}>Resumo do Pedido</Typography>
                                    
                                    <Stack spacing={3} sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={700}>Serviço</Typography>
                                            <Typography variant="body2" fontWeight={800} color="#0F172A">Consulta Médica</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={700}>Especialista</Typography>
                                            <Typography variant="body2" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={700}>Data e Hora</Typography>
                                            <Typography variant="body2" fontWeight={800} color="#0F172A">{agendamento.data_agendamento.split('-').reverse().join('/')} às {agendamento.horario}</Typography>
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ borderStyle: 'dashed', mb: 4 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" color="text.secondary" fontWeight={800}>Total a pagar</Typography>
                                        <Typography variant="h4" fontWeight={900} color="#10B981">R$ {agendamento.valor_consulta || '0,00'}</Typography>
                                    </Box>

                                    <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(2)} sx={{ mt: 6, color: '#64748B', fontWeight: 900, textTransform: 'none' }}>Voltar e editar horário</Button>
                                </Box>

                                {/* Métodos de Pagamento */}
                                <Box sx={{ flex: 1.3, p: 6, bgcolor: '#FFF' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                                        <Lock size={18} color="#10B981" />
                                        <Typography variant="caption" fontWeight={900} color="#10B981" sx={{ letterSpacing: 1 }}>CHECKOUT SEGURO</Typography>
                                    </Box>
                                    
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4 }}>Como você prefere pagar?</Typography>

                                    <Grid container spacing={2} sx={{ mb: 5 }}>
                                        <Grid item xs={6}>
                                            <Paper 
                                                variant="outlined" 
                                                onClick={() => setMetodoPagamento('pix')}
                                                sx={{ p: 3, borderRadius: 2, cursor: 'pointer', border: metodoPagamento === 'pix' ? '2px solid #009EE3' : '1px solid #E2E8F0', bgcolor: metodoPagamento === 'pix' ? alpha('#009EE3', 0.05) : '#FFF', textAlign: 'center', transition: '0.2s' }}
                                            >
                                                <QrCode size={32} color={metodoPagamento === 'pix' ? '#009EE3' : '#64748B'} style={{ margin: '0 auto 8px' }} />
                                                <Typography variant="subtitle2" fontWeight={800} color={metodoPagamento === 'pix' ? '#009EE3' : '#0F172A'}>Pix</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">Aprovação imediata</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper 
                                                variant="outlined" 
                                                onClick={() => setMetodoPagamento('cartao')}
                                                sx={{ p: 3, borderRadius: 2, cursor: 'pointer', border: metodoPagamento === 'cartao' ? '2px solid #009EE3' : '1px solid #E2E8F0', bgcolor: metodoPagamento === 'cartao' ? alpha('#009EE3', 0.05) : '#FFF', textAlign: 'center', transition: '0.2s' }}
                                            >
                                                <CreditCard size={32} color={metodoPagamento === 'cartao' ? '#009EE3' : '#64748B'} style={{ margin: '0 auto 8px' }} />
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
                                            sx={{ py: 2.5, borderRadius: 2, color: '#FFFFFF', bgcolor: '#009EE3', fontWeight: 900, fontSize: '1rem', '&:hover': { bgcolor: '#008ACA' }, boxShadow: '0 15px 30px rgba(0, 158, 227, 0.3)' }}
                                        >
                                            Pagar com Mercado Pago
                                        </Button>
                                        <Typography variant="caption" textAlign="center" display="block" color="text.secondary" fontWeight={600} sx={{ mt: 3 }}>
                                            Ao clicar, você será redirecionado para o ambiente seguro do Mercado Pago.
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