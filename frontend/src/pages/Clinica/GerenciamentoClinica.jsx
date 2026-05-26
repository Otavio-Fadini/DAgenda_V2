import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, 
    Button, CircularProgress, Alert, Snackbar, Fade, Avatar, IconButton, 
    Tabs, Tab 
} from '@mui/material';
import { Building2, MapPin, Phone, Mail, Save, Camera, FileText, Map, Search } from 'lucide-react';

const GerenciamentoClinica = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        nome_fantasia: '', cnpj: '', telefone: '', email: '', logo: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
    });

    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                const response = await api.get('/clinica/perfil');
                if (response.data) {
                    setFormData({
                        nome_fantasia: response.data.nome_fantasia || '',
                        cnpj: response.data.cnpj || '',
                        telefone: response.data.telefone || '',
                        email: response.data.email || '',
                        logo: response.data.logo || '',
                        cep: response.data.cep || '',
                        rua: response.data.rua || '',
                        numero: response.data.numero || '',
                        bairro: response.data.bairro || '',
                        cidade: response.data.cidade || '',
                        estado: response.data.estado || ''
                    });
                    if (response.data.logo) setPreview(response.data.logo);
                }
            } catch (error) {
                showNotification("Erro ao carregar dados da clínica.", "error");
            } finally {
                setLoading(false);
            }
        };
        carregarPerfil();
    }, []);

    // Conversão de imagem para Base64
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

    // Lógica inteligente de busca de CEP (ViaCEP)
    const handleCepChange = async (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
        
        // Aplica máscara 00000-000
        let formatado = value;
        if (value.length > 5) {
            formatado = value.replace(/^(\d{5})(\d)/, "$1-$2");
        }
        
        setFormData({ ...formData, cep: formatado });

        // Quando chegar a 8 números, faz a busca
        if (value.length === 8) {
            setBuscandoCep(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
                const data = await res.json();
                
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        rua: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        estado: data.uf
                    }));
                    showNotification("Endereço encontrado!", "success");
                } else {
                    showNotification("CEP não encontrado.", "error");
                }
            } catch (err) {
                showNotification("Erro ao buscar CEP na internet.", "error");
            } finally {
                setBuscandoCep(false);
            }
        }
    };

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            await api.put('/clinica/perfil', formData);
            showNotification("Dados da clínica atualizados com sucesso!", "success");
        } catch (error) {
            showNotification("Erro ao atualizar os dados.", "error");
        } finally {
            setSalvando(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', backgroundColor: '#F8FAFC', transition: 'all 0.2s',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#32B5FE' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' }
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
            <CircularProgress sx={{ color: '#32B5FE' }} />
        </Box>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', p: { xs: 2, md: 4 }, boxSizing: 'border-box' }}>
            
            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>Gerenciamento da Clínica</Typography>
                    <Typography variant="body2" color="#64748B" fontWeight={500}>Configure os dados cadastrais, contato e a localização da sua unidade.</Typography>
                </Box>
                <Button 
                    variant="contained" onClick={handleSalvar} disabled={salvando}
                    startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                    sx={{ py: 1.5, px: 4, borderRadius: '12px', bgcolor: '#0F172A', fontWeight: 800, color: '#FFFFFF', textTransform: 'none', '&:hover': { bgcolor: '#32B5FE' } }}
                >
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Box>

            {/* ABAS */}
            <Tabs 
                value={tabValue} onChange={(e, v) => setTabValue(v)} 
                sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { fontWeight: 800, textTransform: 'none' }, '& .Mui-selected': { color: '#32B5FE !important' }, '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3 } }}
            >
                <Tab icon={<Building2 size={18}/>} iconPosition="start" label="Identidade & Contato" />
                <Tab icon={<Map size={18}/>} iconPosition="start" label="Localização" />
            </Tabs>

            {/* ÁREA DE CONTEÚDO */}
            <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: '24px', border: '1px solid #E2E8F0', p: 4, overflowY: 'auto', bgcolor: 'white' }}>
                <Fade in={true} timeout={400} key={tabValue}>
                    <Box>
                        
                        {/* ABA 0: IDENTIDADE E CONTATO */}
                        {tabValue === 0 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #F1F5F9' } }}>
                                    <Box sx={{ position: 'relative', mb: 2 }}>
                                        <Avatar variant="rounded" src={preview} sx={{ width: 160, height: 160, borderRadius: '24px', border: '4px solid #F8FAFC', bgcolor: '#F1F5F9', color: '#94A3B8' }}>
                                            {!preview && <Building2 size={60} strokeWidth={1.5} />}
                                        </Avatar>
                                        <input accept="image/*" type="file" id="logo-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                                        <label htmlFor="logo-upload">
                                            <IconButton component="span" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: '#32B5FE', color: 'white', border: '4px solid #fff', width: 44, height: 44, '&:hover': { bgcolor: '#0F172A' } }}>
                                                <Camera size={20} />
                                            </IconButton>
                                        </label>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" fontWeight={600} sx={{ maxWidth: 200, mt: 2 }}>
                                        Logomarca da unidade. Formatos suportados: PNG ou JPG.
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Dados Principais</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Nome Fantasia" value={formData.nome_fantasia} onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})} sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="CNPJ" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Telefone / WhatsApp" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="E-mail de Contato" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={modernInputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {/* ABA 1: LOCALIZAÇÃO (COM BUSCA VIA CEP) */}
                        {tabValue === 1 && (
                            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Endereço da Clínica</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField 
                                            fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} 
                                            inputProps={{ maxLength: 9 }} sx={modernInputStyle} 
                                            InputProps={{ 
                                                startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment>,
                                                endAdornment: buscandoCep && <InputAdornment position="end"><CircularProgress size={20} color="inherit" /></InputAdornment>
                                            }} 
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Rua / Logradouro" value={formData.rua} onChange={(e) => setFormData({...formData, rua: e.target.value})} sx={modernInputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField fullWidth label="Número" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} sx={modernInputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth label="Bairro" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} sx={modernInputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth label="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} sx={modernInputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField fullWidth label="Estado" inputProps={{ maxLength: 2 }} placeholder="UF" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} sx={modernInputStyle} />
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