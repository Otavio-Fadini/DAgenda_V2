import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Avatar, IconButton } from '@mui/material';
import { Building2, Mail, Lock, FileText, Camera, Phone } from 'lucide-react'; // Adicionei Phone
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const CadastroClinica = () => {
    // AJUSTADO: Nomes dos campos batendo exatamente com o Backend (auth.js)
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
            // Por enquanto vamos focar no cadastro textual para o Banco rodar
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // AJUSTADO: Enviando objeto simples (JSON), não FormData
            // Isso resolve o erro 500 se o backend não estiver usando 'multer'
            await axios.post('https://dagenda.com.br/api/auth/cadastro-clinica', formData);
            alert("Clínica cadastrada com sucesso!");
            navigate('/');
        } catch (err) { 
            console.error(err);
            alert(err.response?.data?.message || "Erro ao cadastrar clínica");
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
                    Gestão de Unidade / Clínica
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5, position: 'relative' }}>
                        <Avatar variant="rounded" src={preview} sx={{ 
                            width: 140, height: 90, border: '5px solid #fff', 
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)', bgcolor: '#f8fafc' 
                        }}>
                            <Building2 size={45} color="#cbd5e1" />
                        </Avatar>
                        <input accept="image/*" type="file" id="logo-clinica" style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor="logo-clinica">
                            <IconButton component="span" sx={{ 
                                position: 'absolute', bottom: -10, right: '32%', 
                                bgcolor: '#0f172a', color: 'white', border: '3px solid #fff',
                                '&:hover': { bgcolor: '#32B5FE' }
                            }}>
                                <Camera size={16} />
                            </IconButton>
                        </label>
                    </Box>

                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Nome Fantasia" variant="filled" 
                                value={formData.nome_fantasia}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Building2 size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="CNPJ" variant="filled" 
                                value={formData.cnpj}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><FileText size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, cnpj: e.target.value})} />
                        </Grid>
                        {/* ADICIONADO: Campo de Telefone que estava faltando no Form mas existe no SQL */}
                        <Grid item xs={12}>
                            <TextField fullWidth label="Telefone / WhatsApp" variant="filled" 
                                value={formData.telefone}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Phone size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, telefone: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="E-mail Administrativo" variant="filled" 
                                value={formData.email}
                                InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Mail size={18} color="#64748b"/></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f1f5f9' } }} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Senha de Acesso" type="password" variant="filled" 
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
                            mt: 5, borderRadius: 4, fontWeight: 800, py: 2, 
                            bgcolor: '#0f172a', color: 'white', textTransform: 'none',
                            fontSize: '1.1rem', '&:hover': { bgcolor: '#32B5FE', color: 'white' }
                        }}
                    >
                        Registrar Clínica
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

export default CadastroClinica;