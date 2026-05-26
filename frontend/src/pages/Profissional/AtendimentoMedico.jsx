import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, TextField, Button, Divider, 
    Avatar, Stack, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText, Fade 
} from '@mui/material';
import { 
    Save, ArrowLeft, ClipboardList, Pill, 
    Clock, Activity, CheckCircle2, AlertCircle, Info, FileText, FileCheck 
} from 'lucide-react';
import api from '../../services/api';

const AtendimentoMedico = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [evolucao, setEvolucao] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [loading, setLoading] = useState(false);

    // Se o médico acessar a URL direto sem passar pela agenda, volta para a agenda
    if (!state) {
        navigate('/dashboard/agenda-medica');
        return null;
    }

    const finalizarAtendimento = async () => {
        if (!evolucao.trim()) return alert("A evolução clínica é obrigatória.");
        
        const pacienteIdReal = state.id_paciente || state.pacienteId || state.id_user;
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
                
                {/* HEADER FIXO */}
                <Paper elevation={0} sx={{ p: 2, px: 4, borderBottom: '1px solid #F1F5F9', borderRadius: 0, bgcolor: 'white', zIndex: 10 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Button onClick={() => navigate(-1)} startIcon={<ArrowLeft size={18} />} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>Voltar</Button>
                            <Divider orientation="vertical" flexItem />
                            <Avatar sx={{ bgcolor: '#0F172A', fontWeight: 900, width: 40, height: 40 }}>{state.paciente?.[0] || 'P'}</Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={900} color="#0F172A">{state.paciente}</Typography>
                                <Typography variant="caption" color="#64748B" fontWeight={700}>Consulta: {state.data} • {state.hora}</Typography>
                            </Box>
                        </Stack>

                        <Button 
                            variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit"/> : <Save size={18}/>}
                            onClick={finalizarAtendimento} disabled={loading}
                            sx={{ bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: '#32B5FE' } }}
                        >
                            {loading ? 'Salvando...' : 'Finalizar Atendimento'}
                        </Button>
                    </Box>
                </Paper>

                {/* CORPO DO ATENDIMENTO (SPLIT VIEW) */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    {/* ESQUERDA: CAMPOS DE TEXTO */}
                    <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight={900} color="#32B5FE" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClipboardList size={18} /> ANAMNESE E EVOLUÇÃO
                            </Typography>
                            <TextField fullWidth multiline minRows={8} value={evolucao} onChange={(e) => setEvolucao(e.target.value)}
                                placeholder="Registre a queixa principal, exame físico e evolução..."
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: '16px' } }}
                            />
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight={900} color="#10B981" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Pill size={18} /> PRESCRIÇÃO E CONDUTA
                            </Typography>
                            <TextField fullWidth multiline minRows={4} value={prescricao} onChange={(e) => setPrescricao(e.target.value)}
                                placeholder="Medicamentos, dosagens e encaminhamentos..."
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: '16px' } }}
                            />
                        </Paper>
                    </Box>

                    {/* DIREITA: PAINEL AUXILIAR */}
                    <Box sx={{ width: 380, bgcolor: 'white', borderLeft: '1px solid #F1F5F9', p: 4, overflowY: 'auto' }}>
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>Painel Auxiliar</Typography>
                        
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: '1px' }}>CHECKLIST</Typography>
                                <List sx={{ mt: 1 }}>
                                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                                        <ListItemIcon sx={{ minWidth: 35 }}>{evolucao.length > 20 ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#CBD5E1" />}</ListItemIcon>
                                        <ListItemText primary="Evolução preenchida" primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                                    </ListItem>
                                </List>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: '1px' }}>AÇÕES RÁPIDAS</Typography>
                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <Button variant="outlined" startIcon={<FileText size={16}/>} sx={{ borderRadius: '12px', justifyContent: 'flex-start', color: '#64748B', borderColor: '#E2E8F0', textTransform: 'none', fontWeight: 700 }}>Solicitar Exames</Button>
                                    <Button variant="outlined" startIcon={<FileCheck size={16}/>} sx={{ borderRadius: '12px', justifyContent: 'flex-start', color: '#64748B', borderColor: '#E2E8F0', textTransform: 'none', fontWeight: 700 }}>Emitir Atestado</Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default AtendimentoMedico;