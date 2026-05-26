import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, Button, CircularProgress, Alert, Snackbar, Fade, Divider, Stack } from '@mui/material';
import { DollarSign, Clock, CheckCircle2, Shield, Settings, Info } from 'lucide-react';
import api from '../../services/api';

const ConfiguracoesPerfil = () => {
    const [formData, setFormData] = useState({
        valor_consulta: '',
        duracao_sessao: '',
        atende_convenio: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                setFormData({
                    valor_consulta: response.data.valor_consulta || '',
                    duracao_sessao: response.data.duracao_sessao || '30',
                    atende_convenio: response.data.atende_convenio === 1
                });
            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                showNotification("Erro ao carregar dados", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profissional/perfil', formData);
            showNotification("Configurações salvas com sucesso!", "success");
        } catch (err) {
            showNotification("Falha ao atualizar configurações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });

    // Estilo Moderno dos Inputs
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#32B5FE' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' }
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#32B5FE' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#94A3B8' }}>Carregando perfil...</Typography>
        </Box>
    );

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>Configurações</Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>Ajuste seus honorários, tempo de atendimento e disponibilidade.</Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} lg={8}>
                        <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ 
                            p: { xs: 3, md: 6 }, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Settings size={20} color="#32B5FE" /> Parâmetros de Atendimento
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ ml: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valor da Consulta (R$)</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" placeholder="0,00" value={formData.valor_consulta}
                                        onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})}
                                        sx={{ mt: 1, ...modernInputStyle }}
                                        InputProps={{ 
                                            startAdornment: <InputAdornment position="start"><DollarSign size={20} color="#32B5FE"/></InputAdornment> 
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ ml: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duração (Minutos)</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" placeholder="30" type="number" value={formData.duracao_sessao}
                                        onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})}
                                        sx={{ mt: 1, ...modernInputStyle }}
                                        InputProps={{ 
                                            startAdornment: <InputAdornment position="start"><Clock size={20} color="#32B5FE"/></InputAdornment> 
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 5, borderStyle: 'dashed', borderColor: '#F1F5F9' }} />

                            <Box sx={{ 
                                p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                            }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '12px', color: '#10B981', display: 'flex' }}><Shield size={24} /></Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Atendimento via Convênio</Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Permitir que pacientes de planos agendem consultas.</Typography>
                                    </Box>
                                </Stack>
                                <Switch 
                                    checked={formData.atende_convenio}
                                    onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})}
                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }}
                                />
                            </Box>

                            <Button 
                                fullWidth type="submit" variant="contained" size="large" disabled={saving}
                                sx={{ 
                                    mt: 5, py: 2, borderRadius: '16px', bgcolor: '#0F172A', fontWeight: 900, 
                                    textTransform: 'none', fontSize: '1rem', boxShadow: 'none', color: 'white',
                                    '&:hover': { bgcolor: '#32B5FE', boxShadow: '0 10px 20px -10px rgba(50, 181, 254, 0.5)' }
                                }}
                            >
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Atualizar Configurações'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
                </Snackbar>
            </Box>
        </Fade>
    );
};

export default ConfiguracoesPerfil;