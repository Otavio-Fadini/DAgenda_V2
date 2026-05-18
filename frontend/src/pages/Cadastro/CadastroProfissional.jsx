import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Avatar, IconButton } from '@mui/material';
import { User, Mail, Lock, Stethoscope, Camera, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const CadastroProfissional = () => {
    // CORRIGIDO: 'registro' mudou para 'crm' para bater com o Backend
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
            // Preview apenas visual, o envio será via JSON para simplificar
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // AJUSTADO: Enviando como JSON simples para bater com o seu auth.js atual
            await axios.post('http://localhost:3001/api/auth/cadastro-profissional', formData);
            alert("Profissional cadastrado com sucesso!");
            navigate('/');
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Erro ao cadastrar profissional");
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', p: 2 
        }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 4, md: 6 }, borderRadius: 10, maxWidth: 500, width: '100%', 
                border: '1px solid #e2e8f0', textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' 
            }}>
                <Box sx={{ mb: 3 }}>
                    <img src={logoImg} alt="DAGENDA" style={{ height: '60px', objectFit: 'contain' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Cadastro de Profissional de Saúde
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5, position: 'relative' }}>
                        <Avatar src={preview} sx={{ 
                            width: 100, height: 100, border: '5px solid #fff', 
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)', bgcolor: '#f8fafc' 
                        }}>
                            <User size={45} color="#cbd5e1" />
                        </Avatar>
                        <input accept="image/*" type="file" id="foto-prof" style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor="foto-prof">
                            <IconButton component="span" sx={{ 
                                position: 'absolute', bottom: 0, right: '35%', 
                                bgcolor: '#0f172a', color: 'white', border: '2px solid #fff',
                                '&:hover': { bgcolor: '#32B5FE' }
                            }}>
                                <Camera size={14} />
                            </IconButton>
                        </label>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Nome Completo" variant="filled" 
                                value={formData.nome}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><User size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="CRM / Registro" variant="filled" 
                                value={formData.crm} // Mudado de registro para crm
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><CreditCard size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, crm: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Especialidade" variant="filled" 
                                value={formData.especialidade}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Stethoscope size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, especialidade: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="E-mail Profissional" variant="filled" 
                                value={formData.email}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Mail size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Senha" type="password" variant="filled" 
                                value={formData.senha}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Lock size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, senha: e.target.value})} />
                        </Grid>
                    </Grid>

                    <Button 
                        fullWidth 
                        variant="contained" 
                        type="submit" 
                        size="large" 
                        sx={{ 
                            mt: 4, borderRadius: 4, fontWeight: 800, py: 2, 
                            bgcolor: '#0f172a', color: 'white', textTransform: 'none',
                            '&:hover': { bgcolor: '#32B5FE' }
                        }}
                    >
                        Cadastrar Profissional
                    </Button>
                </form>
                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Já possui uma conta? <Button onClick={() => navigate('/')} sx={{ fontWeight: 800, textTransform: 'none', color: '#32B5FE' }}>Fazer Login</Button>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default CadastroProfissional;