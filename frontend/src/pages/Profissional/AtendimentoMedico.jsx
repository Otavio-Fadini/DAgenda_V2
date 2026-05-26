import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, TextField, Button, Divider, 
    Avatar, Stack, CircularProgress, Alert, List, ListItem, 
    ListItemIcon, ListItemText, Fade, IconButton 
} from '@mui/material';
import { 
    Save, ArrowLeft, ClipboardList, Pill, 
    Clock, Activity, CheckCircle2, AlertCircle, Info, FileText 
} from 'lucide-react';
import api from '../../services/api';

const AtendimentoMedico = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Estados do Prontuário
    const [evolucao, setEvolucao] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [loading, setLoading] = useState(false);

    // Proteção de rota caso o state venha vazio
    if (!state) {
        navigate('/dashboard/agenda-medica');
        return null;
    }

    const finalizarAtendimento = async () => {
        if (!evolucao.trim()) return alert("A evolução clínica é obrigatória.");
        
        const pacienteIdReal = state.id_paciente || state.pacienteId || state.id_user;
        if (!pacienteIdReal) {
            console.error("Dados do estado:", state);
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

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
                
                {/* HEADER FIXO - Mantendo a estrutura original completa */}
                <Paper elevation={0} sx={{ p: 2, px: 4, borderBottom: '1px solid #E2E8F0', borderRadius: 0, bgcolor: 'white', zIndex: 10 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Button onClick={() => navigate('/dashboard/agenda-medica')} startIcon={<ArrowLeft size={20} />} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>Voltar</Button>
                            <Divider orientation="vertical" flexItem />
                            <Avatar sx={{ bgcolor: '#0F172A', fontWeight: 900, width: 40, height: 40 }}>{state.paciente?.[0] || 'P'}</Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={900} color="#0F172A">{state.paciente}</Typography>
                                <Typography variant="caption" color="#64748B" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clock size={12} /> {state.hora} • <Activity size={12} /> {state.tipo || 'Consulta'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Button 
                            variant="contained" 
                            startIcon={loading ? <CircularProgress size={18} color="inherit"/> : <Save size={18}/>}
                            onClick={finalizarAtendimento}
                            disabled={loading}
                            sx={{ 
                                bgcolor: '#0F172A', borderRadius: 2.5, fontWeight: 900, px: 4, py: 1.2, textTransform: 'none', color: '#FFFFFF',
                                '&:hover': { bgcolor: '#32B5FE' } 
                            }}
                        >
                            {loading ? 'Salvando...' : 'Finalizar Atendimento'}
                        </Button>
                    </Box>
                </Paper>

                {/* ÁREA DE TRABALHO (SPLIT) */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    {/* CAMPOS DE EDIÇÃO (ESQUERDA) */}
                    <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight={900} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClipboardList size={18} /> ANAMNESE E EVOLUÇÃO CLÍNICA
                            </Typography>
                            <TextField
                                multiline fullWidth minRows={10} value={evolucao} onChange={(e) => setEvolucao(e.target.value)}
                                placeholder="Descreva o quadro clínico, exame físico e observações..."
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: 3, fontSize: '1rem' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#F1F5F9' } }}
                            />
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight={900} color="secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Pill size={18} /> PRESCRIÇÃO E CONDUTA
                            </Typography>
                            <TextField
                                multiline fullWidth minRows={5} value={prescricao} onChange={(e) => setPrescricao(e.target.value)}
                                placeholder="Medicamentos, dosagens e orientações..."
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: 3, fontSize: '1rem' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#F1F5F9' } }}
                            />
                        </Paper>
                    </Box>

                    {/* PAINEL AUXILIAR (DIREITA) */}
                    <Box sx={{ width: 380, bgcolor: 'white', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', p: 3 }}>
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 3, color: '#0F172A' }}>Painel Auxiliar</Typography>
                        
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1.2 }}>CHECKLIST DE AUDITORIA</Typography>
                                    <List sx={{ mt: 1 }}>
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 35 }}>{evolucao.length > 20 ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#94A3B8" />}</ListItemIcon>
                                            <ListItemText primary="Evolução detalhada" primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 35 }}>{prescricao.length > 5 ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#94A3B8" />}</ListItemIcon>
                                            <ListItemText primary="Conduta preenchida" primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1.2 }}>DADOS DA SESSÃO</Typography>
                                    <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" fontWeight={700} color="#64748B">ID Atendimento:</Typography><Typography variant="caption" fontWeight={800}>#{state.id}</Typography></Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" fontWeight={700} color="#64748B">Profissional:</Typography><Typography variant="caption" fontWeight={800}>Você</Typography></Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" fontWeight={700} color="#64748B">Início:</Typography><Typography variant="caption" fontWeight={800}>{state.hora}</Typography></Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                <Alert icon={<Info size={18} />} severity="info" sx={{ borderRadius: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                                    Ao finalizar, este prontuário será criptografado e anexado permanentemente.
                                </Alert>
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                            <Button fullWidth variant="outlined" size="small" sx={{ mb: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0' }}>Solicitar Exames</Button>
                            <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0' }}>Atestado Médico</Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default AtendimentoMedico;