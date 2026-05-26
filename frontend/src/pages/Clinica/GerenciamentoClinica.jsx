import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, 
    Button, CircularProgress, Alert, Snackbar, Fade, Avatar, IconButton, 
    Tabs, Tab 
} from '@mui/material';
import { Building2, MapPin, Phone, Mail, Save, Camera, FileText, Map } from 'lucide-react';

const GerenciamentoClinica = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        nome_fantasia: '',
        cnpj: '',
        endereco: '',
        telefone: '',
        email: '',
        logo: '' // Agora preparado para receber a imagem em Base64
    });

    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                const response = await api.get('/clinica/perfil');
                
                if (response.data) {
                    setFormData({
                        nome_fantasia: response.data.nome_fantasia || '',
                        cnpj: response.data.cnpj || '',
                        endereco: response.data.endereco || '',
                        telefone: response.data.telefone || '',
                        email: response.data.email || '',
                        logo: response.data.logo || ''
                    });
                    
                    if (response.data.logo) {
                        setPreview(response.data.logo);
                    }
                }
            } catch (error) {
                showNotification("Erro ao carregar dados da clínica.", "error");
            } finally {
                setLoading(false);
            }
        };

        carregarPerfil();
    }, []);

    // Conversão de imagem para Base64 para salvar via JSON
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result });
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            await api.put('/clinica/perfil', formData);
            showNotification("Dados da clínica atualizados com sucesso!", "success");
        } catch (error) {
            showNotification(error.response?.data?.message || "Erro ao atualizar os dados.", "error");
        } finally {
            setSalvando(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#32B5FE' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
            </Box>
        );
    }

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', p: { xs: 2, md: 4 }, boxSizing: 'border-box' }}>
            
            {/* CABEÇALHO FIXO COM BOTÃO DE SALVAR */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>
                        Gerenciamento da Clínica
                    </Typography>
                    <Typography variant="body2" color="#64748B" fontWeight={500}>
                        Configure os dados cadastrais e a identidade visual da sua unidade.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    onClick={handleSalvar}
                    disabled={salvando}
                    startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                    sx={{ 
                        py: 1.5, px: 4, borderRadius: '12px', bgcolor: '#0F172A', fontWeight: 800, color: '#FFFFFF', textTransform: 'none',
                        boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)', transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' }
                    }}
                >
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Box>

            {/* ABAS DE NAVEGAÇÃO */}
            <Tabs 
                value={tabValue} onChange={(e, v) => setTabValue(v)} 
                sx={{ 
                    mb: 3, borderBottom: '1px solid #E2E8F0', 
                    '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '1rem', color: '#64748B' }, 
                    '& .Mui-selected': { color: '#32B5FE !important' }, 
                    '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3, borderRadius: '3px 3px 0 0' } 
                }}
            >
                <Tab icon={<Building2 size={18}/>} iconPosition="start" label="Identidade & Registro" />
                <Tab icon={<Map size={18}/>} iconPosition="start" label="Contato & Localização" />
            </Tabs>

            {/* ÁREA DE CONTEÚDO (Com rolagem interna isolada) */}
            <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: '24px', border: '1px solid #E2E8F0', p: 4, overflowY: 'auto', bgcolor: 'white', boxSizing: 'border-box' }}>
                <Fade in={true} timeout={400} key={tabValue}>
                    <Box>
                        
                        {/* ABA 0: IDENTIDADE & REGISTRO */}
                        {tabValue === 0 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #F1F5F9' }, pb: { xs: 4, md: 0 } }}>
                                    <Box sx={{ position: 'relative', mb: 2 }}>
                                        <Avatar variant="rounded" src={preview} sx={{ width: 160, height: 160, mx: 'auto', borderRadius: '24px', border: '4px solid #F8FAFC', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', bgcolor: '#F1F5F9', color: '#94A3B8' }}>
                                            {!preview && <Building2 size={60} strokeWidth={1.5} />}
                                        </Avatar>
                                        <input accept="image/*" type="file" id="logo-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                                        <label htmlFor="logo-upload">
                                            <IconButton component="span" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: '#32B5FE', color: 'white', border: '4px solid #fff', width: 44, height: 44, boxShadow: '0 4px 10px rgba(50,181,254,0.4)', '&:hover': { bgcolor: '#0F172A', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                                <Camera size={20} />
                                            </IconButton>
                                        </label>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" fontWeight={600} sx={{ maxWidth: 200, mt: 2 }}>
                                        Recomendado: Imagem quadrada em formato PNG ou JPG. Processamento Base64 automático.
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Dados Cadastrais</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField 
                                                fullWidth label="Nome Fantasia" variant="outlined" value={formData.nome_fantasia} 
                                                onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})} 
                                                sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={18} color="#94A3B8"/></InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="CNPJ" variant="outlined" value={formData.cnpj} 
                                                onChange={(e) => setFormData({...formData, cnpj: e.target.value})} 
                                                sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {/* ABA 1: CONTATO & LOCALIZAÇÃO */}
                        {tabValue === 1 && (
                            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Informações de Comunicação</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField 
                                            fullWidth label="Endereço Completo" variant="outlined" value={formData.endereco} 
                                            onChange={(e) => setFormData({...formData, endereco: e.target.value})} 
                                            sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField 
                                            fullWidth label="Telefone / WhatsApp" variant="outlined" value={formData.telefone} 
                                            onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
                                            sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField 
                                            fullWidth label="E-mail Administrativo" variant="outlined" value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                            sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
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

export default GerenciamentoClinica;