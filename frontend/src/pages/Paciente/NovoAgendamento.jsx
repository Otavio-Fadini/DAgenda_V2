import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, MenuItem, TextField, Button, Stepper, Step, 
    StepLabel, Avatar, CardActionArea, Divider, FormControlLabel, Switch, 
    Chip, Stack, CircularProgress, InputBase, alpha, IconButton, Fade, Zoom,
    Alert, AlertTitle
} from '@mui/material';
import { 
    Search, MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, 
    Building2, User, Car, LocateFixed, ArrowRight, CheckCircle, Clock, Wifi, Accessibility
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

// MAPA REAL
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Fallback de distância em linha reta caso a API do OSRM falhe
const calcularDistanciaLinhaReta = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
};

const NovoAgendamento = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([]);
    const [clinicas, setClinicas] = useState([]);
    const [mapCenter, setMapCenter] = useState([-22.4331, -47.3581]);
    const [pacienteLatLng, setPacienteLatLng] = useState(null);

    const [busca, setBusca] = useState('');
    const [apenasConvenio, setApenasConvenio] = useState(false);

    // ESTADOS PARA OS HORÁRIOS DINÂMICOS
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    const [agendamento, setAgendamento] = useState({ 
        id_profissional: '', nome_medico: '', valor_consulta: '', id_clinica: '', nome_clinica: '', data_agendamento: '', horario: '' 
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [resProf, resEnd] = await Promise.all([
                    api.get('/agendamentos/profissionais'),
                    api.get('/agendamentos/meu-endereco').catch(() => ({ data: {} })) 
                ]);
                
                setProfissionais(resProf.data);
                setProfissionaisFiltrados(resProf.data);

                const pacEnd = resEnd.data;
                if (pacEnd && pacEnd.rua && pacEnd.cidade) {
                    const query = `${pacEnd.rua}, ${pacEnd.numero ? pacEnd.numero + ', ' : ''}${pacEnd.cidade}, ${pacEnd.estado || 'SP'}, Brasil`;
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        setPacienteLatLng({ lat: geoData[0].lat, lng: geoData[0].lon });
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        const filtered = profissionais.filter(p => {
            const matchTexto = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.especialidade.toLowerCase().includes(busca.toLowerCase());
            const matchConvenio = apenasConvenio ? Number(p.atende_convenio) === 1 : true;
            return matchTexto && matchConvenio;
        });
        setProfissionaisFiltrados(filtered);
    }, [busca, apenasConvenio, profissionais]);

    const selectMedico = async (id, nome, valor) => {
        setAgendamento({ ...agendamento, id_profissional: id, nome_medico: nome, valor_consulta: valor, data_agendamento: '', horario: '' });
        setLoading(true); 
        
        try {
            const res = await api.get(`/agendamentos/vinculos/clinicas/${id}`);
            const clinicasObtidas = res.data;
            const clinicasComMapaEDistancia = [];

            for (const c of clinicasObtidas) {
                let lat = null;
                let lng = null;

                if (c.rua && c.cidade) {
                    try {
                        const query = `${c.rua}, ${c.numero ? c.numero + ', ' : ''}${c.cidade}, ${c.estado || 'SP'}, Brasil`;
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                        const geoData = await geoRes.json();
                        
                        if (geoData && geoData.length > 0) {
                            lat = geoData[0].lat;
                            lng = geoData[0].lon;
                        }
                        await new Promise(r => setTimeout(r, 300));
                    } catch (e) { }
                }

                let distanciaKm = null;
                if (pacienteLatLng && lat && lng) {
                    try {
                        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${pacienteLatLng.lng},${pacienteLatLng.lat};${lng},${lat}?overview=false`);
                        const osrmData = await osrmRes.json();
                        if (osrmData.routes && osrmData.routes.length > 0) {
                            distanciaKm = (osrmData.routes[0].distance / 1000).toFixed(1); 
                        }
                    } catch (osrmError) {
                        distanciaKm = calcularDistanciaLinhaReta(pacienteLatLng.lat, pacienteLatLng.lng, lat, lng);
                    }
                }

                clinicasComMapaEDistancia.push({ ...c, latitude: lat, longitude: lng, distancia: distanciaKm });
            }

            setClinicas(clinicasComMapaEDistancia);

            const primeiraComMapa = clinicasComMapaEDistancia.find(c => c.latitude && c.longitude);
            if (primeiraComMapa) setMapCenter([parseFloat(primeiraComMapa.latitude), parseFloat(primeiraComMapa.longitude)]);

            setActiveStep(1);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // FUNÇÃO INTELIGENTE QUE BUSCA OS HORÁRIOS QUANDO A DATA É SELECIONADA
    const handleDataChange = async (e) => {
        const dataSelecionada = e.target.value;
        setAgendamento({ ...agendamento, data_agendamento: dataSelecionada, horario: '' });
        
        if (!dataSelecionada) {
            setHorariosDisponiveis([]);
            return;
        }

        setLoadingHorarios(true);
        try {
            const res = await api.get(`/agendamentos/horarios-disponiveis?id_profissional=${agendamento.id_profissional}&data=${dataSelecionada}`);
            setHorariosDisponiveis(res.data);
        } catch (err) {
            console.error("Erro ao buscar horários", err);
        } finally {
            setLoadingHorarios(false);
        }
    };

    // NOVA FUNÇÃO: PRÉ-AGENDAR E REDIRECIONAR PARA TELA DE PAGAMENTO
    const handleConfirmarAgendamento = async () => {
        setLoading(true);
        try {
            await api.post('/agendamentos/agendar', {
                id_profissional: agendamento.id_profissional,
                id_clinica: agendamento.id_clinica,
                data_agendamento: agendamento.data_agendamento,
                horario: agendamento.horario,
                valor_consulta: agendamento.valor_consulta,
                nome_medico: agendamento.nome_medico
            });

            // Redireciona para o painel de agendamentos onde está o botão do Mercado Pago
            navigate('/dashboard/meus-agendamentos');
        } catch (err) { 
            console.error(err);
            alert("Erro ao realizar o pré-agendamento. Tente novamente."); 
        } finally { 
            setLoading(false); 
        }
    };

    const getIconForComodidade = (nome) => {
        const text = nome.toLowerCase();
        if (text.includes('estacionamento') || text.includes('vaga')) return <Car size={14} />;
        if (text.includes('wi-fi') || text.includes('internet')) return <Wifi size={14} />;
        if (text.includes('acesso') || text.includes('cadeira')) return <Accessibility size={14} />;
        return <ShieldCheck size={14} />;
    };

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', bgcolor: '#F8FAFC', transition: 'all 0.2s',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { bgcolor: '#FFFFFF', boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' },
            '&.Mui-disabled': { bgcolor: '#F1F5F9' }
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
            
            {/* TOP BAR */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFF', borderBottom: '1px solid #F1F5F9', zIndex: 10 }}>
                <Stepper activeStep={activeStep} sx={{ width: '100%', maxWidth: 800, '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.9rem', color: '#64748B' }, '& .MuiStepLabel-label.Mui-active': { color: '#0F172A', fontWeight: 900 } }}>
                    {['Especialista', 'Localização', 'Agendamento', 'Confirmação'].map(label => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
                </Stepper>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2, borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#E2E8F0', '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' } }}>Cancelar</Button>
            </Box>

            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                
                {/* PASSO 0: PROFISSIONAIS */}
                {activeStep === 0 && (
                    <Fade in={activeStep === 0}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 3, md: 6 } }}>
                            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                                <Box sx={{ mb: 5 }}>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1.5px' }}>Encontre seu especialista</Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>Selecione o profissional ideal para o seu atendimento.</Typography>
                                </Box>

                                <Paper elevation={0} sx={{ p: 1.5, mb: 6, borderRadius: '20px', display: 'flex', alignItems: 'center', border: '1px solid #F1F5F9', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)' }}>
                                    <Box sx={{ flex: 2, px: 2 }}>
                                        <Stack direction="row" spacing={2} sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '14px', display: 'flex', alignItems: 'center' }}>
                                            <Search size={22} color="#32B5FE" />
                                            <InputBase fullWidth placeholder="Busque por nome ou especialidade..." value={busca} onChange={e => setBusca(e.target.value)} sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#0F172A' }} />
                                        </Stack>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ height: 40, mx: 2, borderColor: '#F1F5F9' }} />
                                    <Box sx={{ flex: 1, px: 2 }}>
                                        <FormControlLabel control={<Switch checked={apenasConvenio} onChange={e => setApenasConvenio(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }} />} label={<Typography variant="subtitle2" fontWeight={800} color="#64748B">ACEITA CONVÊNIO</Typography>} />
                                    </Box>
                                </Paper>

                                <Grid container spacing={4}>
                                    {loading ? (
                                        <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}><CircularProgress sx={{ color: '#32B5FE' }} /></Box>
                                    ) : (
                                        profissionaisFiltrados.map(prof => (
                                            <Grid item xs={12} sm={6} lg={4} key={prof.id}>
                                                <Zoom in={true}>
                                                    <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', transition: 'all 0.3s ease', bgcolor: '#FFFFFF', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)', '&:hover': { transform: 'translateY(-6px)', borderColor: '#32B5FE', boxShadow: '0 20px 40px -10px rgba(50, 181, 254, 0.15)'} }}>
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
                                                                    <IconButton sx={{ bgcolor: '#F8FAFC', color: '#0F172A', transition: 'all 0.2s', '&:hover': { bgcolor: '#32B5FE', color: '#FFF', transform: 'translateX(4px)' } }}><ChevronRight /></IconButton>
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
                        <Box sx={{ width: { xs: '100%', md: 460 }, borderRight: '1px solid #F1F5F9', bgcolor: '#FFF', display: 'flex', flexDirection: 'column', zIndex: 5, boxShadow: '20px 0 40px -20px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.5px' }}>Onde agendar?</Typography>
                                <Typography variant="body2" color="#64748B" fontWeight={600}>Unidades que atendem com <Box component="span" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Box></Typography>
                            </Box>
                            
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {clinicas.map((c, i) => {
                                    const lat = c.latitude ? parseFloat(c.latitude) : -22.4331 + (i * 0.01);
                                    const lng = c.longitude ? parseFloat(c.longitude) : -47.3581 + (i * 0.01);

                                    let enderecoCompleto = c.endereco || 'Endereço não cadastrado';
                                    if (c.rua) enderecoCompleto = `${c.rua}${c.numero ? `, ${c.numero}` : ''} • ${c.bairro || c.cidade}${c.estado ? `/${c.estado}` : ''}`;
                                    
                                    const comodidadesArray = c.comodidades ? c.comodidades.split(',').map(item => item.trim()) : [];
                                    const imagemClinica = c.foto_perfil || c.logo;

                                    return (
                                        <CardActionArea 
                                            key={c.id} 
                                            onMouseEnter={() => setMapCenter([lat, lng])}
                                            onClick={() => { setAgendamento({...agendamento, id_clinica: c.id, nome_clinica: c.nome_fantasia}); setActiveStep(2); }}
                                            sx={{ p: 3, borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s', '&:hover': { bgcolor: alpha('#32B5FE', 0.04), pl: 4 } }}
                                        >
                                            <Stack direction="row" spacing={3} alignItems="center">
                                                <Avatar src={imagemClinica} variant="rounded" sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
                                                    {!imagemClinica && <Building2 size={32} strokeWidth={1.5} />}
                                                </Avatar>
                                                
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2, mb: 0.5 }}>{c.nome_fantasia}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                                        <MapPin size={14} color="#64748B" style={{ marginTop: '2px', marginRight: '6px', flexShrink: 0 }} />
                                                        <Typography variant="body2" color="#64748B" fontWeight={500} sx={{ lineHeight: 1.3 }}>{enderecoCompleto}</Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: '8px 0' }}>
                                                        {c.distancia && (
                                                            <Chip label={`${c.distancia} km`} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '8px', height: 24, fontSize: '0.7rem' }} icon={<LocateFixed size={12}/>} />
                                                        )}
                                                        {comodidadesArray.map((comodidade, index) => (
                                                            <Stack key={index} direction="row" spacing={0.5} alignItems="center" sx={{ color: '#10B981', bgcolor: '#ECFDF5', px: 1, py: 0.5, borderRadius: '8px' }}>
                                                                {getIconForComodidade(comodidade)}
                                                                <Typography variant="caption" fontWeight={800}>{comodidade}</Typography>
                                                            </Stack>
                                                        ))}
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

                        <Box sx={{ flex: 1, zIndex: 0, display: { xs: 'none', md: 'block' } }}>
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
                                                    {(c.foto_perfil || c.logo) && <Avatar src={c.foto_perfil || c.logo} sx={{ width: 40, height: 40, mx: 'auto', mb: 1, borderRadius: '8px' }} />}
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

                {/* PASSO 2: REVISÃO DE HORÁRIO (COM BUSCA INTELIGENTE) */}
                {activeStep === 2 && (
                    <Fade in={activeStep === 2}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={0} sx={{ maxWidth: 1000, width: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, border: '1px solid #F1F5F9', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}>
                                
                                <Box sx={{ flex: 1, p: 6, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFF', position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(50, 181, 254, 0.15) 0%, rgba(0,0,0,0) 70%)' }} />
                                    
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Typography variant="overline" sx={{ color: '#32B5FE', fontWeight: 900, letterSpacing: 2 }}>PASSO 3</Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ mb: 6, mt: 1, color: '#FFFFFF', letterSpacing: '-1px' }}>Defina o horário</Typography>
                                        
                                        <Stack spacing={4}>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56, borderRadius: '16px' }}><User color="#32B5FE" /></Avatar>
                                                <Box><Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px' }}>ESPECIALISTA</Typography><Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_medico}</Typography></Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56, borderRadius: '16px' }}><Building2 color="#32B5FE" /></Avatar>
                                                <Box><Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.5px' }}>UNIDADE</Typography><Typography variant="h6" fontWeight={800} sx={{color: '#FFFFFF'}}>{agendamento.nome_clinica}</Typography></Box>
                                            </Box>
                                        </Stack>
                                        <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(1)} sx={{ mt: 10, color: '#32B5FE', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: 'rgba(50,181,254,0.1)' } }}>Alterar Unidade</Button>
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1.2, p: { xs: 4, md: 6 }, bgcolor: '#FFF' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4, letterSpacing: '-0.5px' }}>Escolha a data e o horário</Typography>
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.5px' }}>DATA DA CONSULTA</Typography>
                                            <TextField 
                                                fullWidth type="date" variant="outlined" sx={modernInputStyle} 
                                                value={agendamento.data_agendamento} 
                                                onChange={handleDataChange} 
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ display: 'block', mb: 1.5, letterSpacing: '0.5px' }}>HORÁRIO DISPONÍVEL</Typography>
                                            <TextField 
                                                fullWidth select variant="outlined" sx={modernInputStyle} 
                                                value={agendamento.horario} 
                                                onChange={e => setAgendamento({...agendamento, horario: e.target.value})}
                                                disabled={!agendamento.data_agendamento || loadingHorarios}
                                            >
                                                {loadingHorarios ? (
                                                    <MenuItem disabled sx={{ fontWeight: 700 }}><CircularProgress size={16} sx={{ mr: 1 }}/> Carregando grade...</MenuItem>
                                                ) : horariosDisponiveis.length === 0 ? (
                                                    <MenuItem disabled sx={{ fontWeight: 700 }}>
                                                        {agendamento.data_agendamento ? 'Nenhum horário livre neste dia' : 'Selecione uma data primeiro'}
                                                    </MenuItem>
                                                ) : (
                                                    horariosDisponiveis.map(h => <MenuItem key={h} value={h} sx={{ fontWeight: 700, color: '#0F172A' }}>{h}</MenuItem>)
                                                )}
                                            </TextField>
                                        </Box>
                                        
                                        <Box sx={{ pt: 2 }}>
                                            <Button fullWidth variant="contained" size="large" onClick={() => setActiveStep(3)} disabled={!agendamento.data_agendamento || !agendamento.horario} endIcon={<ArrowRight />} sx={{ py: 2, borderRadius: '12px', color: '#FFFFFF', bgcolor: '#0F172A', fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)', transition: 'all 0.3s', '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' }, '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' } }}>Avançar para Pagamento</Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                )}

                {/* PASSO 3: CONFIRMAÇÃO DE PRÉ-AGENDAMENTO */}
                {activeStep === 3 && (
                    <Fade in={activeStep === 3}>
                        <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Paper elevation={0} sx={{ maxWidth: 1000, width: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, border: '1px solid #F1F5F9', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' }}>
                                <Box sx={{ flex: 1, p: 6, bgcolor: '#F8FAFC', borderRight: '1px solid #F1F5F9' }}>
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 4, letterSpacing: '-0.5px' }}>Resumo do Pedido</Typography>
                                    <Stack spacing={3} sx={{ mb: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" color="#64748B" fontWeight={700}>Serviço</Typography><Typography variant="body1" fontWeight={800} color="#0F172A">Consulta Médica</Typography></Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" color="#64748B" fontWeight={700}>Especialista</Typography><Typography variant="body1" fontWeight={800} color="#0F172A">{agendamento.nome_medico}</Typography></Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" color="#64748B" fontWeight={700}>Data e Hora</Typography><Typography variant="body1" fontWeight={800} color="#0F172A">{agendamento.data_agendamento.split('-').reverse().join('/')} às {agendamento.horario}</Typography></Box>
                                    </Stack>
                                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#CBD5E1', mb: 4 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="subtitle1" color="#64748B" fontWeight={800}>Total a pagar</Typography><Typography variant="h4" fontWeight={900} color="#10B981" sx={{ letterSpacing: '-1px' }}>R$ {agendamento.valor_consulta || '0,00'}</Typography></Box>
                                    <Button startIcon={<ChevronLeft />} onClick={() => setActiveStep(2)} sx={{ mt: 6, color: '#64748B', fontWeight: 800, textTransform: 'none', borderRadius: '10px', '&:hover': { bgcolor: '#E2E8F0' } }}>Voltar e editar horário</Button>
                                </Box>

                                <Box sx={{ flex: 1.3, p: 6, bgcolor: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                                        <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '8px', display: 'flex' }}>
                                            <Clock size={16} color="#3B82F6" />
                                        </Box>
                                        <Typography variant="caption" fontWeight={900} color="#3B82F6" sx={{ letterSpacing: '1px' }}>
                                            PRÉ-AGENDAMENTO
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 2, letterSpacing: '-0.5px' }}>
                                        Confirmação de Horário
                                    </Typography>

                                    <Alert 
                                        severity="info" 
                                        icon={<Clock size={24} />} 
                                        sx={{ mb: 4, borderRadius: '16px', bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', '& .MuiAlert-icon': { color: '#B45309' } }}
                                    >
                                        <AlertTitle sx={{ fontWeight: 800, color: '#B45309' }}>Regra de Reserva (24h)</AlertTitle>
                                        Ao confirmar, este horário ficará reservado no seu nome com status <strong>Pendente</strong>. 
                                        Você será redirecionado para a tela de agendamentos, onde terá <strong>até 24 horas</strong> para concluir a transação via Mercado Pago.
                                    </Alert>

                                    <Box sx={{ mt: 'auto' }}>
                                        <Button 
                                            fullWidth 
                                            variant="contained" 
                                            size="large" 
                                            onClick={handleConfirmarAgendamento} 
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                                            sx={{ 
                                                py: 2, borderRadius: '12px', color: '#FFFFFF', bgcolor: '#0F172A', 
                                                fontWeight: 800, fontSize: '1.1rem', textTransform: 'none', 
                                                boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)', transition: 'all 0.3s', 
                                                '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' } 
                                            }}
                                        >
                                            {loading ? 'Confirmando...' : 'Confirmar Pré-Agendamento'}
                                        </Button>
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