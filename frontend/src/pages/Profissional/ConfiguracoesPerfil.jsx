import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, 
    Button, CircularProgress, Alert, Snackbar, Fade, Divider, Stack, Avatar, IconButton 
} from '@mui/material';
import { DollarSign, Clock, Shield, Settings, User, Briefcase, FileText, Camera, Lock, Calendar } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    const [formData, setFormData] = useState({
        nome: '', email: '', conselho: '', especialidade: '', 
        valor_consulta: '', duracao_sessao: '', atende_convenio: false,
        senha: '', // Campo para nova senha
        disponibilidade: [
            { dia: 'Segunda', inicio: '08:00', fim: '18:00' },
            { dia: 'Terça', inicio: '08:00', fim: '18:00' },
            { dia: 'Quarta', inicio: '08:00', fim: '18:00' },
            { dia: 'Quinta', inicio: '08:00', fim: '18:00' },
            { dia: 'Sexta', inicio: '08:00', fim: '18:00' }
        ]
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                setFormData(prev => ({ ...prev, ...response.data, atende_convenio: response.data.atende_convenio === 1 }));
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={900}>Configurações de Perfil</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* FOTO E DADOS PESSOAIS */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center' }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    <Avatar sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: '#0F172A' }} />
                                    <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#32B5FE', color: 'white', '&:hover': { bgcolor: '#0F172A' } }}>
                                        <Camera size={20} />
                                    </IconButton>
                                </Box>
                                <Typography variant="h6" fontWeight={800}>{formData.nome}</Typography>
                                <Typography variant="caption" color="text.secondary">{formData.especialidade}</Typography>
                            </Paper>
                        </Grid>

                        {/* DADOS CADASTRAIS */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}><User size={20}/> Dados Profissionais</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}><TextField fullWidth label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} sx={inputStyle} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth label="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={inputStyle} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth label="Nova Senha" type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, senha: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18}/></InputAdornment> }} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth label="Conselho/CRM" value={formData.conselho} onChange={(e) => setFormData({...formData, conselho: e.target.value})} sx={inputStyle} /></Grid>
                                    <Grid item xs={6}><TextField fullWidth label="Especialidade" value={formData.especialidade} onChange={(e) => setFormData({...formData, especialidade: e.target.value})} sx={inputStyle} /></Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* DISPONIBILIDADE E PARAMETROS */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, borderRadius: '24px' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}><Calendar size={20}/> Horários de Atendimento</Typography>
                                <Grid container spacing={2}>
                                    {formData.disponibilidade.map((item, index) => (
                                        <Grid item xs={12} md={2.4} key={index}>
                                            <Typography variant="caption" fontWeight={700}>{item.dia}</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <TextField size="small" value={item.inicio} />
                                                <TextField size="small" value={item.fim} />
                                            </Stack>
                                        </Grid>
                                    ))}
                                </Grid>
                                
                                <Divider sx={{ my: 4 }} />
                                
                                <Grid container spacing={4} alignItems="center">
                                    <Grid item xs={4}><TextField fullWidth label="Valor Consulta" value={formData.valor_consulta} onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={18}/></InputAdornment> }}/></Grid>
                                    <Grid item xs={4}><TextField fullWidth label="Duração (min)" value={formData.duracao_sessao} onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18}/></InputAdornment> }}/></Grid>
                                    <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ mr: 2 }}>Aceita Convênio?</Typography>
                                        <Switch checked={formData.atende_convenio} onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})} />
                                    </Grid>
                                </Grid>

                                <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 5, py: 2, borderRadius: '16px', bgcolor: '#0F172A', fontWeight: 900 }}>
                                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações Globais'}
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Box>
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Fade>
    );
};

export default ConfiguracoesPerfil;