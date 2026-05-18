import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, TextField, Button, Divider, 
    Avatar, Stack, CircularProgress, Alert, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { 
    Save, ArrowLeft, ClipboardList, Pill, 
    User, Clock, Activity, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import api from '../../services/api';

const AtendimentoMedico = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [evolucao, setEvolucao] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [loading, setLoading] = useState(false);

    if (!state) return null;

    const finalizarAtendimento = async () => {
        if (!evolucao.trim()) return alert("A evolução clínica é obrigatória.");
        
        // Tenta pegar o ID de todas as formas possíveis que podem vir do estado
        const pacienteIdReal = state.id_paciente || state.pacienteId || state.id_user;

        if (!pacienteIdReal) {
            console.error("Dados do estado:", state);
            return alert("Erro: ID do paciente não encontrado nos dados da agenda.");
        }

        setLoading(true);
        try {
            await api.post('/profissional/finalizar-atendimento', {
                id_agendamento: state.id,
                id_paciente: pacienteIdReal, // Enviando o ID garantido
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
        <Box sx={{ 
            height: 'calc(100vh - 64px)', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#F8FAFC', 
            overflow: 'hidden' 
        }}>
            
            {/* HEADER */}
            <Paper elevation={0} sx={{ p: 2, borderBottom: '1px solid #E2E8F0', borderRadius: 0, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Button 
                            onClick={() => navigate('/dashboard/agenda-medica')}
                            startIcon={<ArrowLeft size={20} />}
                            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
                        >
                            Voltar
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#0F172A', fontWeight: 900, width: 40, height: 40 }}>
                                {state.paciente[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={900} color="#0F172A">
                                    {state.paciente}
                                </Typography>
                                <Typography variant="caption" color="#64748B" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clock size={12} /> {state.hora} • <Activity size={12} /> {state.tipo || 'Consulta'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>

                    <Button 
                        variant="contained" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit"/> : <Save size={18}/>}
                        onClick={finalizarAtendimento}
                        disabled={loading}
                        sx={{ 
                            bgcolor: '#0F172A', 
                            borderRadius: 2.5, 
                            fontWeight: 900, 
                            px: 4, 
                            textTransform: 'none',
                            color: '#FFFFFF',
                            '&:hover': { bgcolor: '#32B5FE' } 
                        }}
                    >
                        {loading ? 'Salvando...' : 'Finalizar Atendimento'}
                    </Button>
                </Box>
            </Paper>

            {/* ÁREA DE TRABALHO */}
            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                
                {/* CAMPOS DE EDIÇÃO (ESQUERDA) */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, gap: 3, overflowY: 'auto' }}>
                    
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                        <Typography variant="subtitle2" fontWeight={900} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ClipboardList size={18} /> ANAMNESE E EVOLUÇÃO CLÍNICA
                        </Typography>
                        <TextField
                            multiline
                            fullWidth
                            minRows={10}
                            value={evolucao}
                            onChange={(e) => setEvolucao(e.target.value)}
                            placeholder="Descreva o quadro clínico, exame físico e observações..."
                            variant="outlined"
                            sx={{ 
                                '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: 3, fontSize: '1rem' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#F1F5F9' }
                            }}
                        />
                    </Paper>

                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                        <Typography variant="subtitle2" fontWeight={900} color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Pill size={18} /> PRESCRIÇÃO E CONDUTA
                        </Typography>
                        <TextField
                            multiline
                            fullWidth
                            minRows={5}
                            value={prescricao}
                            onChange={(e) => setPrescricao(e.target.value)}
                            placeholder="Medicamentos, dosagens e orientações..."
                            variant="outlined"
                            sx={{ 
                                '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', borderRadius: 3, fontSize: '1rem' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#F1F5F9' }
                            }}
                        />
                    </Paper>
                </Box>

                {/* PAINEL LATERAL DE INTELIGÊNCIA (DIREITA) */}
                <Box sx={{ 
                    width: 380, 
                    bgcolor: 'white', 
                    borderLeft: '1px solid #E2E8F0', 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 3
                }}>
                    <Typography variant="h6" fontWeight={900} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0F172A' }}>
                        Painel Auxiliar
                    </Typography>
                    
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <Stack spacing={3}>
                            
                            {/* STATUS DO PRONTUÁRIO */}
                            <Box>
                                <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1.2 }}>CHECKLIST DE AUDITORIA</Typography>
                                <List sx={{ mt: 1 }}>
                                    <ListItem disablePadding sx={{ mb: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                            {evolucao.length > 20 ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#94A3B8" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Evolução detalhada" 
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: evolucao.length > 20 ? '#10B981' : '#64748B' }} 
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                            {prescricao.length > 5 ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#94A3B8" />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Conduta preenchida" 
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: prescricao.length > 5 ? '#10B981' : '#64748B' }} 
                                        />
                                    </ListItem>
                                </List>
                            </Box>

                            <Divider />

                            {/* INFORMAÇÕES DO SISTEMA */}
                            <Box>
                                <Typography variant="caption" fontWeight={900} color="#94A3B8" sx={{ letterSpacing: 1.2 }}>DADOS DA SESSÃO</Typography>
                                <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" fontWeight={700} color="#64748B">ID Atendimento:</Typography>
                                            <Typography variant="caption" fontWeight={800}>#{state.id}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" fontWeight={700} color="#64748B">Profissional:</Typography>
                                            <Typography variant="caption" fontWeight={800}>Você</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" fontWeight={700} color="#64748B">Início:</Typography>
                                            <Typography variant="caption" fontWeight={800}>{state.hora}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>

                            {/* ORIENTAÇÃO RÁPIDA */}
                            <Alert 
                                icon={<Info size={18} />} 
                                severity="info" 
                                sx={{ 
                                    borderRadius: 3, 
                                    bgcolor: '#F0F9FF', 
                                    border: '1px solid #E0F2FE',
                                    '& .MuiAlert-message': { fontSize: '0.75rem', fontWeight: 600, color: '#0369A1' }
                                }}
                            >
                                Ao finalizar, este prontuário será criptografado e anexado ao histórico do paciente de forma permanente.
                            </Alert>

                        </Stack>
                    </Box>

                    {/* BOTÕES DE ATALHO RÁPIDO NO RODAPÉ LATERAL */}
                    <Box sx={{ mt: 3 }}>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            sx={{ mb: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0' }}
                        >
                            Solicitar Exames
                        </Button>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0' }}
                        >
                            Atestado Médico
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AtendimentoMedico;