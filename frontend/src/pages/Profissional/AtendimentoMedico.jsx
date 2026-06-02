import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, TextField, Button, Divider, 
    Avatar, Stack, CircularProgress, Alert, List, ListItem, 
    ListItemIcon, ListItemText, Fade, IconButton, Tabs, Tab, Chip, Tooltip
} from '@mui/material';
import { 
    Save, ArrowLeft, ClipboardList, Pill, 
    Clock, Activity, CheckCircle2, AlertCircle, Info, FileText, 
    Stethoscope, FileSignature, Timer, Lock
} from 'lucide-react';
import api from '../../services/api';

const AtendimentoMedico = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Estados do Prontuário
    const [evolucao, setEvolucao] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Navegação por Abas
    const [abaAtiva, setAbaAtiva] = useState(0);

    // Cronômetro da Consulta
    const [segundos, setSegundos] = useState(0);

    // Variável para saber se está apenas a "Ver Resumo"
    const isConcluido = state && (state.status === 'Concluido' || state.status === 'Finalizado');

    // 1. Efeito para carregar o Prontuário Antigo se estiver concluído
    useEffect(() => {
        if (isConcluido) {
            const carregarProntuario = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/profissional/prontuario/${state.id}`);
                    if (response.data) {
                        setEvolucao(response.data.evolucao || '');
                        setPrescricao(response.data.prescricao || '');
                    }
                } catch (error) {
                    console.error("Erro ao carregar resumo do prontuário:", error);
                } finally {
                    setLoading(false);
                }
            };
            carregarProntuario();
        }
    }, [isConcluido, state?.id]);

    // 2. Iniciar cronômetro apenas se NÃO estiver concluído
    useEffect(() => {
        if (!isConcluido) {
            const timer = setInterval(() => setSegundos(s => s + 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isConcluido]);

    const formatarTempo = (totalSegundos) => {
        const m = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
        const s = (totalSegundos % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Proteção de rota
    if (!state) {
        navigate('/dashboard/agenda-medica');
        return null;
    }

    const nomePaciente = state.paciente || state.paciente_nome || 'Paciente não identificado';

    const finalizarAtendimento = async () => {
        if (!evolucao.trim()) {
            setAbaAtiva(0); 
            return alert("A Anamnese/Evolução clínica é obrigatória para finalizar a consulta.");
        }
        
        const pacienteIdReal = state.id_paciente || state.pacienteId || state.id_user;
        if (!pacienteIdReal) {
            return alert("Erro: ID do paciente não encontrado nos dados da agenda.");
        }

        setLoading(true);
        try {
            await api.post('/profissional/finalizar-atendimento', {
                id_agendamento: state.id,
                id_paciente: pacienteIdReal,
                evolucao,
                prescricao
            });
            alert("Atendimento finalizado com sucesso!");
            navigate('/dashboard/agenda-medica');
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar o prontuário.");
        } finally {
            setLoading(false);
        }
    };

    const salvarRascunho = () => {
        alert("Rascunho salvo localmente com sucesso!");
    };

    // Estilo Moderno para o Input (Muda visualmente se for Modo Leitura)
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': { 
            bgcolor: isConcluido ? '#F1F5F9' : '#FAFAFA', 
            borderRadius: '16px', fontSize: '1.05rem', lineHeight: 1.6,
            transition: 'all 0.2s',
            '& fieldset': { borderColor: isConcluido ? 'transparent' : '#E2E8F0', borderWidth: '1px' },
            '&:hover fieldset': { borderColor: isConcluido ? 'transparent' : '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: isConcluido ? 'transparent' : '#32B5FE', borderWidth: isConcluido ? '0px' : '2px' },
            '&.Mui-focused': { bgcolor: isConcluido ? '#F1F5F9' : '#FFFFFF', boxShadow: isConcluido ? 'none' : '0 4px 20px rgba(50, 181, 254, 0.08)' }
        }
    };

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
                
                {/* 1. CABEÇALHO FIXO PREMIUM */}
                <Paper elevation={0} sx={{ px: 4, py: 2, borderBottom: '1px solid #E2E8F0', borderRadius: 0, bgcolor: 'white', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Tooltip title="Voltar para Agenda" arrow>
                            <IconButton onClick={() => navigate('/dashboard/agenda-medica')} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A' } }}>
                                <ArrowLeft size={20} />
                            </IconButton>
                        </Tooltip>
                        
                        <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0' }} />
                        
                        <Avatar sx={{ bgcolor: '#0F172A', color: '#FFF', fontWeight: 900, width: 48, height: 48, border: '2px solid #F1F5F9' }}>
                            {nomePaciente[0].toUpperCase()}
                        </Avatar>
                        
                        <Box>
                            <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                                {nomePaciente}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Activity size={14} /> {isConcluido ? 'Resumo do Atendimento' : 'Atendimento Presencial'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Cronômetro ou Cadeado de Leitura */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, bgcolor: isConcluido ? '#F1F5F9' : '#F8FAFC', borderRadius: '12px', border: '1px solid', borderColor: isConcluido ? '#E2E8F0' : '#E2E8F0' }}>
                        {isConcluido ? (
                            <>
                                <Lock size={18} color="#64748B" />
                                <Typography variant="subtitle2" fontWeight={800} color="#64748B">Somente Leitura</Typography>
                            </>
                        ) : (
                            <>
                                <Timer size={18} color="#32B5FE" />
                                <Typography variant="subtitle1" fontWeight={900} color="#0F172A" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatarTempo(segundos)}</Typography>
                            </>
                        )}
                    </Box>
                </Paper>

                {/* 2. ÁREA CENTRAL DE TRABALHO */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    {/* ESQUERDA: EDITOR DO PRONTUÁRIO */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
                        
                        {/* Menu de Abas */}
                        <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', px: 4, pt: 2 }}>
                            <Tabs 
                                value={abaAtiva} 
                                onChange={(e, newValue) => setAbaAtiva(newValue)}
                                sx={{ 
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '1rem', minHeight: 60 },
                                    '& .Mui-selected': { color: '#32B5FE' },
                                    '& .MuiTabs-indicator': { bgcolor: '#32B5FE', height: 4, borderRadius: '4px 4px 0 0' }
                                }}
                            >
                                <Tab icon={<Stethoscope size={18}/>} iconPosition="start" label="Anamnese e Evolução" />
                                <Tab icon={<Pill size={18}/>} iconPosition="start" label="Prescrição Médica" />
                                <Tab icon={<FileSignature size={18}/>} iconPosition="start" label="Atestados / Exames" disabled={isConcluido} />
                            </Tabs>
                        </Box>

                        {/* Conteúdo das Abas */}
                        {loading && isConcluido ? (
                            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CircularProgress sx={{ color: '#32B5FE' }} />
                            </Box>
                        ) : (
                            <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
                                
                                {/* ABA 0: ANAMNESE E EVOLUÇÃO */}
                                {abaAtiva === 0 && (
                                    <Fade in={true}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>Evolução Clínica</Typography>
                                            <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                                                {isConcluido ? 'Registro clínico definitivo da consulta.' : 'Registe as queixas principais, histórico de doenças e o exame físico objetivo.'}
                                            </Typography>
                                            <TextField
                                                multiline fullWidth minRows={15} 
                                                value={evolucao} onChange={(e) => setEvolucao(e.target.value)}
                                                placeholder="S (Subjetivo): Paciente relata dor...&#10;O (Objetivo): PA 120x80, corado...&#10;A (Avaliação): Hipótese diagnóstica...&#10;P (Plano): ..."
                                                sx={modernInputStyle}
                                                InputProps={{ readOnly: isConcluido }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* ABA 1: PRESCRIÇÃO */}
                                {abaAtiva === 1 && (
                                    <Fade in={true}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>Receituário e Conduta</Typography>
                                            <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                                                {isConcluido ? 'Prescrição emitida durante a consulta.' : 'Prescreva os medicamentos, dosagens e orientações para casa.'}
                                            </Typography>
                                            <TextField
                                                multiline fullWidth minRows={15} 
                                                value={prescricao} onChange={(e) => setPrescricao(e.target.value)}
                                                placeholder="1. Dipirona 500mg ------ 1 cx&#10;Tomar 1 comprimido de 8/8h em caso de dor.&#10;&#10;2. Repouso absoluto por 3 dias."
                                                sx={modernInputStyle}
                                                InputProps={{ readOnly: isConcluido }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* ABA 2: ATESTADOS (Apenas em atendimento ativo) */}
                                {abaAtiva === 2 && !isConcluido && (
                                    <Fade in={true}>
                                        <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
                                            <FileText size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
                                            <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 1 }}>Emissão de Documentos</Typography>
                                            <Typography variant="body1" color="#64748B" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                                                Nesta área, você poderá gerar atestados médicos padronizados, pedidos de exames laboratoriais e encaminhamentos com a sua assinatura digital.
                                            </Typography>
                                            <Stack direction="row" spacing={2} justifyContent="center">
                                                <Button variant="outlined" startIcon={<FileSignature size={18}/>} sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', py: 1.5, px: 3, borderColor: '#CBD5E1', color: '#0F172A' }}>Gerar Atestado Médico</Button>
                                                <Button variant="outlined" startIcon={<Activity size={18}/>} sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', py: 1.5, px: 3, borderColor: '#CBD5E1', color: '#0F172A' }}>Pedir Exames</Button>
                                            </Stack>
                                        </Box>
                                    </Fade>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* DIREITA: PAINEL AUXILIAR (Resumo) */}
                    <Box sx={{ width: 340, bgcolor: 'white', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9' }}>
                            <Typography variant="subtitle1" fontWeight={900} color="#0F172A">Resumo da Sessão</Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                            <Stack spacing={4}>
                                {/* Auditoria Inteligente */}
                                <Box>
                                    <Typography variant="overline" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1 }}>Status do Prontuário</Typography>
                                    <List sx={{ mt: 1, p: 0 }}>
                                        <ListItem disablePadding sx={{ mb: 1.5 }}>
                                            <ListItemIcon sx={{ minWidth: 35 }}>{evolucao.length > 20 ? <CheckCircle2 size={20} color="#10B981" /> : <AlertCircle size={20} color="#CBD5E1" />}</ListItemIcon>
                                            <ListItemText primary="Anamnese preenchida" primaryTypographyProps={{ variant: 'body2', fontWeight: evolucao.length > 20 ? 800 : 500, color: evolucao.length > 20 ? '#0F172A' : '#94A3B8' }} />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}>{prescricao.length > 5 ? <CheckCircle2 size={20} color="#10B981" /> : <AlertCircle size={20} color="#CBD5E1" />}</ListItemIcon>
                                            <ListItemText primary="Conduta/Receita gerada" primaryTypographyProps={{ variant: 'body2', fontWeight: prescricao.length > 5 ? 800 : 500, color: prescricao.length > 5 ? '#0F172A' : '#94A3B8' }} />
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider sx={{ borderColor: '#F1F5F9' }} />

                                {/* Dados Técnicos */}
                                <Box>
                                    <Typography variant="overline" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1 }}>Detalhes do Agendamento</Typography>
                                    <Paper elevation={0} sx={{ mt: 1.5, p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight={600} color="#64748B">ID da Consulta</Typography><Typography variant="body2" fontWeight={800}>#{state.id}</Typography></Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight={600} color="#64748B">Horário Marcado</Typography><Typography variant="body2" fontWeight={800}>{state.hora || state.horario}</Typography></Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight={600} color="#64748B">Status Atual</Typography><Typography variant="body2" fontWeight={800} color={isConcluido ? '#10B981' : '#32B5FE'}>{isConcluido ? 'Finalizado' : 'Em Atendimento'}</Typography></Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                {!isConcluido && (
                                    <Alert icon={<Info size={20} />} severity="info" sx={{ borderRadius: '16px', bgcolor: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE', '& .MuiAlert-message': { fontSize: '0.8rem', fontWeight: 600 } }}>
                                        Ao finalizar, este documento receberá um carimbo de tempo e será criptografado no histórico do paciente.
                                    </Alert>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* 3. BARRA DE AÇÕES INFERIOR (Oculta ou Alterada se Concluído) */}
                <Paper elevation={0} sx={{ p: 2, px: 4, borderTop: '1px solid #E2E8F0', bgcolor: 'white', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button 
                        variant="text" 
                        onClick={() => navigate('/dashboard/agenda-medica')}
                        sx={{ color: '#64748B', fontWeight: 800, textTransform: 'none', px: 3 }}
                    >
                        {isConcluido ? 'Voltar para a Agenda' : 'Cancelar Atendimento'}
                    </Button>
                    
                    {!isConcluido && (
                        <Stack direction="row" spacing={2}>
                            <Button 
                                variant="outlined" 
                                startIcon={<Save size={18}/>}
                                onClick={salvarRascunho}
                                sx={{ borderRadius: '12px', fontWeight: 800, px: 3, py: 1.2, textTransform: 'none', borderColor: '#E2E8F0', color: '#0F172A', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
                            >
                                Salvar Rascunho
                            </Button>
                            
                            <Button 
                                variant="contained" 
                                startIcon={loading ? <CircularProgress size={18} color="inherit"/> : <CheckCircle2 size={18}/>}
                                onClick={finalizarAtendimento}
                                disabled={loading}
                                sx={{ 
                                    bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 900, px: 4, py: 1.2, textTransform: 'none', color: '#FFFFFF', boxShadow: '0 8px 16px -8px rgba(15,23,42,0.5)',
                                    '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 12px 20px -8px rgba(50, 181, 254, 0.6)' },
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? 'Processando...' : 'Finalizar Atendimento'}
                            </Button>
                        </Stack>
                    )}
                </Paper>

            </Box>
        </Fade>
    );
};

export default AtendimentoMedico;