import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, MenuItem, TextField, 
    Button, Stepper, Step, StepLabel, Avatar, CardActionArea, 
    Divider, InputAdornment, FormControlLabel, Switch 
} from '@mui/material';
import { 
    Calendar, User, Building2, Clock, ChevronRight, 
    ChevronLeft, CheckCircle2, Search, DollarSign 
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NovoAgendamento = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    
    // Estados de Dados
    const [profissionais, setProfissionais] = useState([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([]);
    const [clinicas, setClinicas] = useState([]);
    
    // Estados de Filtro
    const [busca, setBusca] = useState('');
    const [apenasConvenio, setApenasConvenio] = useState(false);
    const [precoMin, setPrecoMin] = useState('');
    const [precoMax, setPrecoMax] = useState('');

    const [agendamento, setAgendamento] = useState({ 
        id_profissional: '', 
        nome_medico: '',
        id_clinica: '', 
        nome_clinica: '',
        data_agendamento: '', 
        horario: '' 
    });

    const steps = ['Escolher Médico', 'Selecionar Clínica', 'Data e Horário'];

    useEffect(() => {
        const carregarMedicos = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/agendamentos/profissionais');
                setProfissionais(res.data);
                setProfissionaisFiltrados(res.data);
            } catch (err) { console.error(err); }
        };
        carregarMedicos();
    }, []);

    // Lógica de Filtro em Tempo Real (Nome, Especialidade, Convênio e Faixa de Preço)
    useEffect(() => {
        const resultado = profissionais.filter(p => {
            const buscaLower = busca.toLowerCase();
            const matchTexto = p.nome.toLowerCase().includes(buscaLower) || 
                               p.especialidade.toLowerCase().includes(buscaLower);
            
            const matchConvenio = apenasConvenio ? p.atende_convenio === 1 : true;
            
            // Lógica de Preço (Mínimo e Máximo)
            const min = precoMin === '' ? 0 : parseFloat(precoMin);
            const max = precoMax === '' ? Infinity : parseFloat(precoMax);
            const matchPreco = p.valor_consulta >= min && p.valor_consulta <= max;

            return matchTexto && matchConvenio && matchPreco;
        });
        setProfissionaisFiltrados(resultado);
    }, [busca, apenasConvenio, precoMin, precoMax, profissionais]);

    const selecionarMedico = async (id, nome) => {
        setAgendamento({ ...agendamento, id_profissional: id, nome_medico: nome });
        try {
            const res = await axios.get(`http://localhost:3001/api/agendamentos/vinculos/clinicas/${id}`);
            setClinicas(res.data);
            setActiveStep(1);
        } catch (err) { console.error(err); }
    };

    const selecionarClinica = (id, nome) => {
        setAgendamento({ ...agendamento, id_clinica: id, nome_clinica: nome });
        setActiveStep(2);
    };

    const finalizarAgendamento = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/agendamentos/agendar', {
                id_profissional: agendamento.id_profissional,
                id_clinica: agendamento.id_clinica,
                data_agendamento: agendamento.data_agendamento,
                horario: agendamento.horario
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Consulta agendada!");
            navigate('/dashboard/meus-agendamentos');
        } catch (err) { alert("Erro ao agendar."); }
    };

    return (
        <Box sx={{ p: 4, width: '100%', minHeight: '100%', bgcolor: '#f8fafc' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Agendar Consulta</Typography>
            </Box>
            
            <Stepper activeStep={activeStep} sx={{ mb: 6, '& .MuiStepIcon-root.Mui-active': { color: '#32B5FE' }, '& .MuiStepIcon-root.Mui-completed': { color: '#32B5FE' } }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {/* BARRA DE FILTROS - PASSO 0 */}
            {activeStep === 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Busca Texto */}
                        <Grid item xs={12} md={4}>
                            <TextField 
                                fullWidth placeholder="Médico ou especialidade..." variant="filled"
                                value={busca} onChange={(e) => setBusca(e.target.value)}
                                InputProps={{ 
                                    disableUnderline: true, 
                                    startAdornment: <InputAdornment position="start"><Search size={20} color="#94a3b8"/></InputAdornment>,
                                    sx: { borderRadius: 3, bgcolor: '#f1f5f9' }
                                }}
                            />
                        </Grid>
                        
                        {/* Valor Mínimo */}
                        <Grid item xs={6} md={1.5}>
                            <TextField
                                fullWidth label="Mín (R$)" type="number"
                                value={precoMin} onChange={(e) => setPrecoMin(e.target.value)}
                                variant="filled"
                                InputProps={{ 
                                    disableUnderline: true, 
                                    sx: { 
                                        borderRadius: 3, bgcolor: '#f1f5f9',
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' }
                                    } 
                                }}
                            />
                        </Grid>

                        {/* Valor Máximo */}
                        <Grid item xs={6} md={1.5}>
                            <TextField
                                fullWidth label="Máx (R$)" type="number"
                                value={precoMax} onChange={(e) => setPrecoMax(e.target.value)}
                                variant="filled"
                                InputProps={{ 
                                    disableUnderline: true, 
                                    sx: { 
                                        borderRadius: 3, bgcolor: '#f1f5f9',
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' }
                                    } 
                                }}
                            />
                        </Grid>

                        {/* Switch de Convênio */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', height: 56, borderRadius: 3, border: '1px solid #f1f5f9' }}>
                                <FormControlLabel
                                    control={<Switch checked={apenasConvenio} onChange={(e) => setApenasConvenio(e.target.checked)} color="primary" />}
                                    label={<Typography variant="body2" fontWeight={700} color="#475569">Convênio</Typography>}
                                    sx={{ m: 0 }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', lineHeight: 1 }}>ENCONTRADOS</Typography>
                            <Typography variant="h5" fontWeight={900} color="#32B5FE">{profissionaisFiltrados.length}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Grid container spacing={3} justifyContent="center">
                {/* LISTAGEM DE MÉDICOS */}
                {activeStep === 0 && profissionaisFiltrados.map(prof => (
                    <Grid item xs={12} md={4} key={prof.id}>
                        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', transition: '0.3s', '&:hover': { borderColor: '#32B5FE', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', transform: 'translateY(-4px)' } }}>
                            <CardActionArea onClick={() => selecionarMedico(prof.id, prof.nome)} sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar src={prof.foto_perfil} sx={{ width: 60, height: 60, border: '2px solid #32B5FE' }}>{prof.nome[0]}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800}>{prof.nome}</Typography>
                                        <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 600 }}>{prof.especialidade}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 700 }}>
                                        <DollarSign size={16} /> R$ {prof.valor_consulta || '0,00'}
                                    </Box>
                                    {prof.atende_convenio === 1 && (
                                        <Typography variant="caption" sx={{ bgcolor: '#dcfce7', color: '#166534', px: 1, borderRadius: 1, fontWeight: 800 }}>ACEITA CONVÊNIO</Typography>
                                    )}
                                </Box>
                            </CardActionArea>
                        </Paper>
                    </Grid>
                ))}

                {/* PASSO 1: CLÍNICAS */}
                {activeStep === 1 && clinicas.map(clinica => (
                    <Grid item xs={12} md={4} key={clinica.id}>
                        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', '&:hover': { borderColor: '#32B5FE' } }}>
                            <CardActionArea onClick={() => selecionarClinica(clinica.id, clinica.nome_fantasia)} sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', color: '#32B5FE' }}><Building2 size={24} /></Avatar>
                                    <Typography variant="h6" fontWeight={800}>{clinica.nome_fantasia}</Typography>
                                </Box>
                            </CardActionArea>
                        </Paper>
                    </Grid>
                ))}

                {/* PASSO 2: FINALIZAR */}
                {activeStep === 2 && (
                    <Grid item xs={12} md={10} lg={8} sx={{ mx: 'auto', mt: 2 }}>
                        <Paper elevation={0} sx={{ p: { xs: 4, md: 7 }, borderRadius: 10, border: '1px solid #e2e8f0', bgcolor: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h4" fontWeight={900} sx={{ mb: 5, textAlign: 'center', color: '#0f172a', letterSpacing: '-1px' }}>Finalizar Agendamento</Typography>
                            
                            <Grid container spacing={6}>
                                <Grid item xs={12} md={6} sx={{ borderRight: { md: '1px solid #f1f5f9' } }}>
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#32B5FE', fontSize: '0.75rem', mb: 3, display: 'block' }}>DADOS DA CONSULTA</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', color: '#32B5FE', width: 60, height: 60 }}><User size={30}/></Avatar>
                                            <Box><Typography variant="caption" color="text.secondary" fontWeight={600}>MÉDICO RESPONSÁVEL</Typography><Typography variant="h6" fontWeight={800}>{agendamento.nome_medico}</Typography></Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', color: '#32B5FE', width: 60, height: 60 }}><Building2 size={30}/></Avatar>
                                            <Box><Typography variant="caption" color="text.secondary" fontWeight={600}>LOCAL DE ATENDIMENTO</Typography><Typography variant="h6" fontWeight={800}>{agendamento.nome_clinica}</Typography></Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="overline" sx={{ fontWeight: 800, color: '#32B5FE', fontSize: '0.75rem', mb: 3, display: 'block' }}>DEFINA O HORÁRIO</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: '#64748b', ml: 1 }}>Data da Consulta</Typography>
                                            <TextField 
                                                fullWidth type="date" variant="filled"
                                                InputProps={{ 
                                                    disableUnderline: true, 
                                                    startAdornment: <Calendar size={20} style={{marginRight: 12, color: '#32B5FE'}}/>,
                                                    sx: { borderRadius: 4, bgcolor: '#f8fafc', height: 60, fontSize: '1.1rem', fontWeight: 600 } 
                                                }}
                                                onChange={(e) => setAgendamento({...agendamento, data_agendamento: e.target.value})}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: '#64748b', ml: 1 }}>Horário Disponível</Typography>
                                            <TextField 
                                                fullWidth select variant="filled" defaultValue=""
                                                InputProps={{ 
                                                    disableUnderline: true, 
                                                    startAdornment: <Clock size={20} style={{marginRight: 12, color: '#32B5FE'}}/>,
                                                    sx: { borderRadius: 4, bgcolor: '#f8fafc', height: 60, fontSize: '1.1rem', fontWeight: 600 } 
                                                }}
                                                onChange={(e) => setAgendamento({...agendamento, horario: e.target.value})}
                                            >
                                                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(h => (
                                                    <MenuItem key={h} value={h} sx={{ fontWeight: 600 }}>{h}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 7, display: 'flex', gap: 3, justifyContent: 'center' }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ChevronLeft size={22}/>} 
                                    onClick={() => setActiveStep(1)} 
                                    sx={{ borderRadius: 5, px: 5, py: 2, fontWeight: 700, border: '2px solid #e2e8f0', color: '#64748b' }}
                                >
                                    Voltar
                                </Button>
                                <Button 
                                    variant="contained" 
                                    endIcon={<CheckCircle2 size={22}/>} 
                                    onClick={finalizarAgendamento} 
                                    disabled={!agendamento.data_agendamento || !agendamento.horario}
                                    sx={{ 
                                        borderRadius: 5, px: 6, py: 2, fontWeight: 800, 
                                        bgcolor: '#0f172a', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' } 
                                    }}
                                >
                                    Confirmar Agendamento
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default NovoAgendamento;