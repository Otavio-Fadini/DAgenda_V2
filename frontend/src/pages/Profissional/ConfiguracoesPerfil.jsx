import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, 
    Button, CircularProgress, Alert, Snackbar, Divider, Avatar, IconButton 
} from '@mui/material';
import { DollarSign, Clock, Shield, User, Briefcase, FileText, Camera, Lock, Calendar } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    // 1. Estado principal unificado com todos os campos do banco
    const [formData, setFormData] = useState({
        nome: '', 
        email: '', 
        conselho: '', 
        especialidade: '', 
        valor_consulta: '', 
        duracao_sessao: '', 
        atende_convenio: false,
        senha: '', 
        foto_perfil: ''
    });

    // 2. Estado para visualizar a foto antes de salvar
    const [photoPreview, setPhotoPreview] = useState(null);

    // 3. Estado da grade de horários
    const [horarios, setHorarios] = useState([
        { dia: 'Segunda', inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', inicio: '08:00', fim: '18:00' }
    ]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    // Busca os dados ao carregar a tela
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                const data = response.data;
                
                setFormData({
                    nome: data.nome || '',
                    email: data.email || '',
                    conselho: data.conselho || '',
                    especialidade: data.especialidade || '',
                    valor_consulta: data.valor_consulta || '',
                    duracao_sessao: data.duracao_sessao || '30',
                    atende_convenio: data.atende_convenio === 1 || data.atende_convenio === true,
                    senha: '', // Mantemos vazio por segurança
                    foto_perfil: data.foto_perfil || ''
                });

                // Se o backend enviar os horários já salvos, preenche a grade
                if (data.horarios && data.horarios.length > 0) {
                    setHorarios(data.horarios);
                }
                
                // Exibe a foto caso já exista no banco
                if (data.foto_perfil) {
                    setPhotoPreview(data.foto_perfil);
                }
            } catch (err) {
                showNotification("Erro ao carregar dados", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    // Atualiza um horário específico
    const handleHorarioChange = (index, field, value) => {
        const novosHorarios = [...horarios];
        novosHorarios[index][field] = value;
        setHorarios(novosHorarios);
    };

    // Lê a imagem escolhida e cria um preview na tela
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, foto_perfil: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Cria a cópia dos dados para enviar
            const dataToSend = { ...formData, horarios };
            
            // FILTRO DE SEGURANÇA: Remove a senha do envio se estiver vazia
            if (!dataToSend.senha) {
                delete dataToSend.senha;
            }

            await api.put('/profissional/perfil', dataToSend);
            showNotification("Perfil atualizado com sucesso!", "success");
        } catch (err) {
            showNotification("Falha ao salvar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });
    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#F8FAFC' } };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#0F172A">Configurações de Perfil</Typography>
                <Typography color="#64748B">Gerencie seus dados, honorários e horários de atendimento.</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    
                    {/* COLUNA ESQUERDA: FOTO */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar 
                                    src={photoPreview} 
                                    sx={{ width: 120, height: 120, mb: 2, border: '4px solid #E2E8F0', fontSize: '3rem', bgcolor: '#0F172A' }}
                                >
                                    {/* Se não houver foto, exibe a inicial do nome */}
                                    {!photoPreview && formData.nome ? formData.nome[0] : ''}
                                </Avatar>
                                <IconButton 
                                    component="label" 
                                    sx={{ position: 'absolute', bottom: 15, right: 0, bgcolor: '#32B5FE', color: 'white', '&:hover': { bgcolor: '#0F172A' } }}
                                >
                                    <Camera size={20} />
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                </IconButton>
                            </Box>
                            <Typography variant="h6" fontWeight={800}>{formData.nome || 'Seu Nome'}</Typography>
                            <Typography variant="caption" color="text.secondary">{formData.especialidade || 'Sua Especialidade'}</Typography>
                        </Paper>
                    </Grid>

                    {/* COLUNA DIREITA: DADOS CADASTRAIS E SENHA */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <User size={20}/> Dados Profissionais
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* O input de senha agora está devidamente bindado no formData.senha */}
                                    <TextField fullWidth label="Nova Senha" type="password" placeholder="••••••••" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18}/></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Conselho/CRM" value={formData.conselho} onChange={(e) => setFormData({...formData, conselho: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18}/></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Especialidade" value={formData.especialidade} onChange={(e) => setFormData({...formData, especialidade: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18}/></InputAdornment> }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* BLOCO INFERIOR: HORÁRIOS E PARÂMETROS GERAIS */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: '24px' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={20}/> Horários de Atendimento
                            </Typography>
                            
                            {/* Renderização dinâmica dos dias da semana */}
                            {horarios.map((h, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">
                                    <Grid item xs={12} md={2}>
                                        <Typography fontWeight={700} color="#0F172A">{h.dia}</Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField fullWidth size="small" label="Início (Ex: 08:00)" value={h.inicio} onChange={(e) => handleHorarioChange(index, 'inicio', e.target.value)} />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField fullWidth size="small" label="Fim (Ex: 18:00)" value={h.fim} onChange={(e) => handleHorarioChange(index, 'fim', e.target.value)} />
                                    </Grid>
                                </Grid>
                            ))}
                            
                            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
                            
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Valor (R$)" value={formData.valor_consulta} onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={18}/></InputAdornment> }} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Duração (min)" value={formData.duracao_sessao} onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18}/></InputAdornment> }} sx={inputStyle} />
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <Shield color="#10B981" size={20} style={{ marginRight: 8 }} />
                                    <Typography sx={{ mr: 2, fontWeight: 700 }}>Aceita Convênio?</Typography>
                                    <Switch checked={formData.atende_convenio} onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }} />
                                </Grid>
                            </Grid>

                            <Button fullWidth type="submit" variant="contained" size="large" disabled={saving} sx={{ mt: 5, py: 2, borderRadius: '16px', bgcolor: '#0F172A', fontWeight: 900, '&:hover': { bgcolor: '#32B5FE' } }}>
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar Todas as Configurações'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </form>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPerfil;