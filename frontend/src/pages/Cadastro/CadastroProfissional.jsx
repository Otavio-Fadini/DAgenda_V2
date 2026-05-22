import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Avatar, IconButton, Fade } from '@mui/material';
import { User, Mail, Lock, Stethoscope, Camera, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const CadastroProfissional = () => {
    const [formData, setFormData] = useState({ 
        nome: '', 
        crm: '', 
        especialidade: '', 
        email: '', 
        senha: '' 
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
            await axios.post('https://dagenda.com.br/api/auth/cadastro-profissional', formData);
            alert("Profissional cadastrado com sucesso!");
            navigate('/');
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Erro ao cadastrar profissional");
        }
    };

    // Estilo customizado e moderno para os Inputs (Mesmo padrão do Paciente)
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
                            Cadastro Médico
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
                            Preencha seus dados para configurar sua agenda profissional
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        {/* Seção da Foto de Perfil */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, position: 'relative' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={preview} sx={{ 
                                    width: 100, height: 100, 
                                    border: '4px solid #ffffff', 
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)', 
                                    bgcolor: '#F1F5F9',
                                    color: '#94A3B8'
                                }}>
                                    {!preview && <User size={40} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="foto-prof" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="foto-prof">
                                    <IconButton component="span" sx={{ 
                                        position: 'absolute', bottom: 0, right: -4, 
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
                                <TextField fullWidth label="Nome Completo" variant="outlined" 
                                    value={formData.nome}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="CRM / Registro" variant="outlined" 
                                    value={formData.crm}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><CreditCard size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, crm: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Especialidade" variant="outlined" 
                                    value={formData.especialidade}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Stethoscope size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, especialidade: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="E-mail Profissional" variant="outlined" type="email"
                                    value={formData.email}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={20} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Senha" type="password" variant="outlined" 
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
                            Cadastrar Profissional
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

export default CadastroProfissional;