import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, 
    Button, CircularProgress, Alert, Snackbar, Fade, Avatar, IconButton, 
    Tabs, Tab, Stack, Divider 
} from '@mui/material';
import { DollarSign, Clock, Shield, User, Briefcase, FileText, Camera, Lock, Calendar, Save } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        nome: '', email: '', conselho: '', especialidade: '', 
        valor_consulta: '', duracao_sessao: '', atende_convenio: false,
        senha: '', foto_perfil: ''
    });

    // Novo modelo de horários moderno com opção de ativar/desativar o dia
    const [horarios, setHorarios] = useState([
        { dia: 'Segunda', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sábado', ativo: false, inicio: '08:00', fim: '12:00' },
        { dia: 'Domingo', ativo: false, inicio: '08:00', fim: '12:00' }
    ]);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                const data = response.data;
                
                setFormData({
                    nome: data.nome || '', email: data.email || '', conselho: data.conselho || '',
                    especialidade: data.especialidade || '', valor_consulta: data.valor_consulta || '',
                    duracao_sessao: data.duracao_sessao || '30', atende_convenio: data.atende_convenio === 1,
                    senha: '', foto_perfil: data.foto_perfil || ''
                });

                if (data.horarios && data.horarios.length > 0) setHorarios(data.horarios);
                if (data.foto_perfil) setPhotoPreview(data.foto_perfil);
            } catch (err) {
                showNotification("Erro ao carregar dados", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    // Conversão de imagem para Base64 para salvar via JSON sem precisar de form-data
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, foto_perfil: reader.result });
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHorarioChange = (index, field, value) => {
        const novosHorarios = [...horarios];
        novosHorarios[index][field] = value;
        setHorarios(novosHorarios);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const dataToSend = { ...formData, horarios };
            if (!dataToSend.senha) delete dataToSend.senha;

            await api.put('/profissional/perfil', dataToSend);
            showNotification("Perfil atualizado com sucesso!", "success");
        } catch (err) {
            showNotification("Falha ao salvar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });
    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#F8FAFC' } };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', p: { xs: 2, md: 4 } }}>
            
            {/* CABEÇALHO COM BOTÃO DE SALVAR */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} color="#0F172A">Configurações</Typography>
                    <Typography variant="body2" color="#64748B">Gerencie sua identidade, agenda e regras de negócio.</Typography>
                </Box>
                <Button 
                    variant="contained" onClick={handleSubmit} disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                    sx={{ bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, textTransform: 'none', '&:hover': { bgcolor: '#32B5FE' } }}
                >
                    Salvar Alterações
                </Button>
            </Box>

            {/* ABAS DE NAVEGAÇÃO */}
            <Tabs 
                value={tabValue} onChange={(e, v) => setTabValue(v)} 
                sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '1rem', color: '#64748B' }, '& .Mui-selected': { color: '#32B5FE !important' }, '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3, borderRadius: '3px 3px 0 0' } }}
            >
                <Tab icon={<User size={18}/>} iconPosition="start" label="Identidade Visual" />
                <Tab icon={<Calendar size={18}/>} iconPosition="start" label="Grade de Horários" />
                <Tab icon={<DollarSign size={18}/>} iconPosition="start" label="Financeiro" />
            </Tabs>

            {/* ÁREA DE CONTEÚDO (Sem scroll na página inteira, apenas aqui dentro se necessário) */}
            <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: '24px', border: '1px solid #E2E8F0', p: 4, overflowY: 'auto' }}>
                <Fade in={true} timeout={400} key={tabValue}>
                    <Box>
                        {/* ABA 0: IDENTIDADE VISUAL & ACESSO */}
                        {tabValue === 0 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #F1F5F9' }}>
                                    <Box sx={{ position: 'relative', mb: 2 }}>
                                        <Avatar src={photoPreview} sx={{ width: 140, height: 140, fontSize: '3rem', bgcolor: '#0F172A', border: '4px solid #F8FAFC', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                            {!photoPreview && formData.nome ? formData.nome[0] : ''}
                                        </Avatar>
                                        <IconButton component="label" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: '#32B5FE', color: 'white', '&:hover': { bgcolor: '#0F172A' } }}>
                                            <Camera size={20} />
                                            <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" textAlign="center">Formatos suportados: JPG, PNG.<br/>Tamanho ideal: 400x400px.</Typography>
                                </Grid>
                                <Grid item xs={12} md={9}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}><TextField fullWidth label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} sx={inputStyle} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="E-mail de Acesso" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={inputStyle} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="Nova Senha (Deixe em branco para manter)" type="password" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18}/></InputAdornment> }} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="Conselho / UF (Ex: CRM-SP)" value={formData.conselho} onChange={(e) => setFormData({...formData, conselho: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18}/></InputAdornment> }} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="Especialidade" value={formData.especialidade} onChange={(e) => setFormData({...formData, especialidade: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18}/></InputAdornment> }} /></Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {/* ABA 1: GRADE DE HORÁRIOS MODERNIZADA */}
                        {tabValue === 1 && (
                            <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Defina seus dias de trabalho</Typography>
                                {horarios.map((h, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 2, borderRadius: '16px', border: h.ativo ? '1px solid #32B5FE' : '1px solid #E2E8F0', bgcolor: h.ativo ? 'rgba(50, 181, 254, 0.02)' : '#F8FAFC', transition: 'all 0.2s' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: 180 }}>
                                            <Switch checked={h.ativo} onChange={(e) => handleHorarioChange(index, 'ativo', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }} />
                                            <Typography fontWeight={700} color={h.ativo ? '#0F172A' : '#94A3B8'}>{h.dia}</Typography>
                                        </Stack>
                                        
                                        {h.ativo ? (
                                            <Stack direction="row" spacing={3} alignItems="center">
                                                <TextField size="small" label="Início" value={h.inicio} onChange={(e) => handleHorarioChange(index, 'inicio', e.target.value)} sx={{ width: 120, bgcolor: 'white', borderRadius: 2 }} />
                                                <Typography color="#94A3B8" fontWeight={900}>Até</Typography>
                                                <TextField size="small" label="Fim" value={h.fim} onChange={(e) => handleHorarioChange(index, 'fim', e.target.value)} sx={{ width: 120, bgcolor: 'white', borderRadius: 2 }} />
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" fontWeight={800} color="#94A3B8" sx={{ flexGrow: 1, textAlign: 'center' }}>Fechado</Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* ABA 2: FINANCEIRO */}
                        {tabValue === 2 && (
                            <Grid container spacing={4} sx={{ maxWidth: 800, margin: '0 auto' }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ mb: 1 }}>Valor Padrão da Consulta</Typography>
                                    <TextField fullWidth value={formData.valor_consulta} onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={18}/></InputAdornment> }} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ mb: 1 }}>Duração de cada Sessão</Typography>
                                    <TextField fullWidth value={formData.duracao_sessao} onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18}/></InputAdornment> }} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 2, p: 3, borderRadius: '16px', bgcolor: '#F0FDF4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Shield color="#16a34a" size={24} />
                                            <Box>
                                                <Typography fontWeight={800} color="#166534">Atendimento por Convênio</Typography>
                                                <Typography variant="caption" color="#166534">Liberar horários na agenda para pacientes com plano de saúde.</Typography>
                                            </Box>
                                        </Box>
                                        <Switch checked={formData.atende_convenio} onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16a34a' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#16a34a' } }} />
                                    </Box>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Fade>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPerfil;