import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, 
    Button, CircularProgress, Alert, Snackbar, Fade, Stack 
} from '@mui/material';
import { DollarSign, Clock, Shield, Settings, User, Briefcase, FileText } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    const [formData, setFormData] = useState({
        nome: '', email: '', conselho: '', especialidade: '', 
        valor_consulta: '', duracao_sessao: '', atende_convenio: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                setFormData({
                    nome: response.data.nome || '',
                    email: response.data.email || '',
                    conselho: response.data.conselho || '',
                    especialidade: response.data.especialidade || '',
                    valor_consulta: response.data.valor_consulta || '',
                    duracao_sessao: response.data.duracao_sessao || '30',
                    atende_convenio: response.data.atende_convenio === 1
                });
            } catch (err) {
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
            showNotification("Perfil atualizado com sucesso!", "success");
        } catch (err) {
            showNotification("Falha ao salvar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });

    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#F8FAFC' } };

    // Renderização do carregamento fora do Fade para evitar o erro de estilo
    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
            <Fade in={!loading} timeout={600}>
                <Box>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={900} color="#0F172A">Configurações de Perfil</Typography>
                        <Typography color="#64748B">Atualize seus dados profissionais e parâmetros de consulta.</Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', height: '100%' }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <User size={20}/> Dados Cadastrais
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField fullWidth label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} sx={inputStyle} />
                                        <TextField fullWidth label="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={inputStyle} />
                                        <TextField fullWidth label="Registro (Conselho/CRM)" value={formData.conselho} onChange={(e) => setFormData({...formData, conselho: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18}/></InputAdornment> }} />
                                        <TextField fullWidth label="Especialidade" value={formData.especialidade} onChange={(e) => setFormData({...formData, especialidade: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18}/></InputAdornment> }} />
                                    </Stack>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', height: '100%' }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Settings size={20}/> Parâmetros
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Valor (R$)" value={formData.valor_consulta} onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={18}/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Duração (min)" value={formData.duracao_sessao} onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18}/></InputAdornment> }} />
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 3, p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Shield color="#10B981" size={20}/>
                                            <Typography fontWeight={700}>Aceita Convênio?</Typography>
                                        </Box>
                                        <Switch checked={formData.atende_convenio} onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})} />
                                    </Box>
                                    <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 4, py: 2, borderRadius: '16px', bgcolor: '#0F172A', fontWeight: 900 }}>
                                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Fade>
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPerfil;