import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { DollarSign, Clock, CheckCircle2, Shield } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    // 1. Estados para controlar os campos do formulário
    const [formData, setFormData] = useState({
        valor_consulta: '',
        duracao_sessao: '',
        atende_convenio: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    // 2. Carrega os dados atuais do profissional ao montar a tela
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                // Mapeia os dados do banco para o estado do formulário
                setFormData({
                    valor_consulta: response.data.valor_consulta || '',
                    duracao_sessao: response.data.duracao_sessao || '30',
                    atende_convenio: response.data.atende_convenio === 1
                });
            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                showNotification("Erro ao carregar dados do perfil", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    // 3. Função para salvar as alterações
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profissional/perfil', formData);
            showNotification("Configurações atualizadas com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao salvar:", err);
            showNotification("Falha ao atualizar configurações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ open: true, message, type });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%', minHeight: '100vh' }}>
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Configurações de Atendimento</Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>Gerencie seus honorários, tempo de sessão e visibilidade.</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Paper 
                        component="form" 
                        onSubmit={handleSubmit}
                        elevation={0} 
                        sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white' }}
                    >
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 4, color: '#0f172a' }}>Parâmetros de Consulta</Typography>
                        
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={900} color="#64748b" sx={{ textTransform: 'uppercase', ml: 1 }}>Valor Particular (Base)</Typography>
                                <TextField 
                                    fullWidth 
                                    variant="filled" 
                                    placeholder="0,00"
                                    value={formData.valor_consulta}
                                    onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})}
                                    InputProps={{ 
                                        disableUnderline: true, 
                                        startAdornment: <InputAdornment position="start"><DollarSign size={20} color="#32B5FE"/></InputAdornment>, 
                                        sx: { borderRadius: 4, bgcolor: '#f8fafc', height: 60, mt: 1, fontSize: '1.2rem', fontWeight: 900 } 
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={900} color="#64748b" sx={{ textTransform: 'uppercase', ml: 1 }}>Duração da Sessão (Minutos)</Typography>
                                <TextField 
                                    fullWidth 
                                    variant="filled" 
                                    placeholder="30"
                                    type="number"
                                    value={formData.duracao_sessao}
                                    onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})}
                                    InputProps={{ 
                                        disableUnderline: true, 
                                        startAdornment: <InputAdornment position="start"><Clock size={20} color="#32B5FE"/></InputAdornment>, 
                                        sx: { borderRadius: 4, bgcolor: '#f8fafc', height: 60, mt: 1, fontSize: '1.2rem', fontWeight: 900 } 
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 5, p: 3, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Shield size={24} color="#10b981" />
                                <Box>
                                    <Typography variant="body1" fontWeight={800}>Habilitar Convênios</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Permitir que pacientes de planos de saúde agendem com você.</Typography>
                                </Box>
                            </Box>
                            <Switch 
                                checked={formData.atende_convenio}
                                onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})}
                            />
                        </Box>

                        <Button 
                            fullWidth 
                            type="submit"
                            variant="contained" 
                            size="large"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle2 />}
                            sx={{ 
                                mt: 5, py: 2.5, borderRadius: 4, bgcolor: '#0f172a', fontWeight: 900, 
                                textTransform: 'none', fontSize: '1.1rem', color: '#FFFFFF', 
                                '&:hover': { bgcolor: '#32B5FE' } 
                            }}
                        >
                            {saving ? 'Salvando...' : 'Atualizar Configurações'}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Notificações de feedback */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={() => setNotification({...notification, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={notification.type} variant="filled" sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPerfil;