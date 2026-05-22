import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Avatar, IconButton, Fade } from '@mui/material';
import { Building2, Mail, Lock, FileText, Camera, Phone } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const CadastroClinica = () => {
    const [formData, setFormData] = useState({ 
        nome_fantasia: '', 
        cnpj: '', 
        email: '', 
        senha: '', 
        telefone: '' 
    });
    
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://dagenda.com.br/api/auth/cadastro-clinica', formData);
            alert("Clínica cadastrada com sucesso!");
            navigate('/');
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Erro ao cadastrar clínica");
        }
    };

    // Estilo customizado e moderno para os Inputs
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

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)', 
            p: 2 
        }}>
            <Fade in={true} timeout={800}>
                <Paper elevation={0} sx={{ 
                    p: { xs: 4, md: 5 }, 
                    borderRadius: '24px', 
                    maxWidth: 550, 
                    width: '100%', 
                    bgcolor: '#ffffff',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 10px rgba(50, 181, 254, 0.05)' 
                }}>
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={logoImg} alt="DAGENDA" style={{ height: '48px', objectFit: 'contain', marginBottom: '16px' }} />
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Cadastro de Unidade
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
                            Registre sua clínica para iniciar a gestão inteligente
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        {/* Seção da Logo da Clínica */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, position: 'relative' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar variant="rounded" src={preview} sx={{ 
                                    width: 120, height: 120, 
                                    borderRadius: '16px',
                                    border: '4px solid #ffffff', 
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)', 
                                    bgcolor: '#F1F5F9',
                                    color: '#94A3B8'
                                }}>
                                    {!preview && <Building2 size={48} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="logo-clinica" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="logo-clinica">
                                    <IconButton component="span" sx={{ 
                                        position: 'absolute', bottom: -8, right: -8, 
                                        bgcolor: '#32B5FE', color: 'white', 
                                        border: '3px solid #fff', width: 36, height: 36,
                                        boxShadow: '0 4px 6px rgba(50,181,254,0.3)',
                                        '&:hover': { bgcolor: '#0f172a', transform: 'scale(1.05)' },
                                        transition: 'all 0.2s'
                                    }}>
                                        <Camera size={18} />
                                    </IconButton>
                                </label>
                            </Box>
                        </Box>

                        {/* Campos do Formulário */}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Nome Fantasia" variant="outlined" 
                                    value={formData.nome_fantasia}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="CNPJ" variant="outlined" 
                                    value={formData.cnpj}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Telefone / WhatsApp" variant="outlined" 
                                    value={formData.telefone}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="E-mail Administrativo" variant="outlined" type="email"
                                    value={formData.email}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Senha de Acesso" type="password" variant="outlined" 
                                    value={formData.senha}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, senha: e.target.value})} required />
                            </Grid>
                        </Grid>

                        <Button fullWidth variant="contained" type="submit" sx={{ 
                            mt: 4, py: 1.8, 
                            borderRadius: '12px', 
                            fontWeight: 700, 
                            fontSize: '1rem',
                            bgcolor: '#0f172a', 
                            color: '#FFFFFF',
                            textTransform: 'none',
                            boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                                bgcolor: '#32B5FE', 
                                boxShadow: '0 10px 20px -10px rgba(50, 181, 254, 0.6)',
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            Registrar Clínica
                        </Button>
                    </form>

                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F1F5F9' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Já possui uma conta? {' '}
                            <Button onClick={() => navigate('/')} disableRipple sx={{ 
                                fontWeight: 800, 
                                textTransform: 'none', 
                                color: '#32B5FE',
                                p: 0,
                                minWidth: 'auto',
                                '&:hover': { background: 'transparent', textDecoration: 'underline' }
                            }}>
                                Fazer Login
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default CadastroClinica;