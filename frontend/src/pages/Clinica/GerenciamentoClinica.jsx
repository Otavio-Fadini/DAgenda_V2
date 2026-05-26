import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, IconButton, Fade, InputAdornment, Divider, CircularProgress } from '@mui/material';
import { Building2, MapPin, Phone, Mail, Save, Camera, FileText } from 'lucide-react';
import api from '../../services/api';

const GerenciamentoClinica = () => {
    const [formData, setFormData] = useState({
        nome_fantasia: '',
        cnpj: '',
        endereco: '',
        telefone: '',
        email: ''
    });
    
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    // 1. BUSCAR DADOS REAIS DO BANCO AO ABRIR A TELA
    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                // Ajuste esta rota para o endpoint exato do seu backend
                const response = await api.get('/clinica/perfil');
                
                if (response.data) {
                    setFormData({
                        nome_fantasia: response.data.nome_fantasia || '',
                        cnpj: response.data.cnpj || '',
                        endereco: response.data.endereco || '',
                        telefone: response.data.telefone || '',
                        email: response.data.email || ''
                    });
                    
                    // Se o banco retornar a URL da logo, carrega no preview
                    if (response.data.logo) {
                        setPreview(response.data.logo);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados da clínica:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarPerfil();
    }, []);

    // 2. SALVAR AS ALTERAÇÕES NO BANCO DE DADOS
    const handleSalvar = async () => {
        setSalvando(true);
        try {
            // Ajuste esta rota para o endpoint de UPDATE do seu backend
            await api.put('/clinica/perfil', formData);
            alert("Dados da clínica atualizados com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert(error.response?.data?.message || "Erro ao atualizar os dados.");
        } finally {
            setSalvando(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            // Opcional: Aqui você pode implementar a lógica do FormData 
            // caso o seu backend já esteja preparado para receber imagens via multer.
        }
    };

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Carregando dados da unidade...</Typography>
            </Box>
        );
    }

    return (
        <Fade in={!loading} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
                
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
                        Gerenciamento da Clínica
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Configure os dados cadastrais e a identidade visual da sua unidade.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* DADOS CADASTRAIS */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 4 }}>
                                Informações Cadastrais
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block' }}>NOME FANTASIA</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.nome_fantasia}
                                        onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block' }}>CNPJ</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block' }}>ENDEREÇO COMPLETO</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block' }}>TELEFONE / WHATSAPP</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block' }}>E-MAIL ADMINISTRATIVO</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4, borderStyle: 'dashed', borderColor: '#E2E8F0' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleSalvar}
                                    disabled={salvando}
                                    startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                                    sx={{ 
                                        py: 1.5, px: 4, 
                                        borderRadius: '12px', 
                                        bgcolor: '#0F172A', 
                                        fontWeight: 800, 
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' }
                                    }}
                                >
                                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* IDENTIDADE VISUAL */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: 'white', textAlign: 'center', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>Identidade Visual</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 4 }}>Logomarca da unidade</Typography>

                            <Box sx={{ position: 'relative', mb: 3 }}>
                                <Avatar variant="rounded" src={preview} sx={{ width: 160, height: 160, mx: 'auto', borderRadius: '24px', border: '4px solid #F8FAFC', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', bgcolor: '#F1F5F9', color: '#94A3B8' }}>
                                    {!preview && <Building2 size={60} strokeWidth={1.5} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="logo-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="logo-upload">
                                    <IconButton component="span" sx={{ position: 'absolute', bottom: -10, right: '25%', bgcolor: '#32B5FE', color: 'white', border: '4px solid #fff', width: 44, height: 44, boxShadow: '0 4px 10px rgba(50,181,254,0.4)', '&:hover': { bgcolor: '#0F172A', transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
                                        <Camera size={20} />
                                    </IconButton>
                                </label>
                            </Box>

                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', maxWidth: 200, mx: 'auto', mt: 2 }}>
                                Recomendado: Imagem quadrada em formato PNG transparente ou JPG (Máx. 2MB).
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
};

export default GerenciamentoClinica;