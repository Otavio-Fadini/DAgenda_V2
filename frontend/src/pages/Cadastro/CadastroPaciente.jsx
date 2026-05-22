import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, InputAdornment, Avatar, IconButton } from '@mui/material';
import { User, Mail, Lock, CreditCard, Camera, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Verifique se o caminho do logo está correto

const CadastroPaciente = () => {
    const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', senha: '', foto: null });
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, foto: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://dagenda.com.br/api/auth/cadastro-paciente', formData);
            
            if (response.status === 201) {
                alert("Paciente cadastrado com sucesso!");
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erro ao realizar cadastro do paciente.");
        }
    };

    return (
        <Grid container sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
            
            {/* LADO ESQUERDO - BRANDING (Industrial & Dark) */}
            <Grid item xs={12} md={5} sx={{ 
                bgcolor: '#0a0a0a', // Preto industrial
                color: '#ffffff',
                display: { xs: 'none', md: 'flex' }, // Esconde no celular
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 6,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Elemento de design no fundo */}
                <Box sx={{ 
                    position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', 
                    background: 'radial-gradient(circle at 20% 30%, rgba(50, 181, 254, 0.08) 0%, transparent 50%)',
                    zIndex: 0 
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <img src={logo} alt="DAGENDA" style={{ height: '40px', objectFit: 'contain', marginBottom: '40px' }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-1px', mb: 2, lineHeight: 1.1 }}>
                        A evolução do<br/>seu atendimento.
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#888', maxWidth: '380px', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Agendamentos ágeis, histórico centralizado e gestão inteligente de ponta a ponta.
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#555', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        © 2026 DAGENDA SYSTEMS
                    </Typography>
                </Box>
            </Grid>

            {/* LADO DIREITO - FORMULÁRIO (Minimalista & Clean) */}
            <Grid item xs={12} md={7} sx={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 } 
            }}>
                <Box sx={{ width: '100%', maxWidth: 480 }}>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111', mb: 1, letterSpacing: '-0.5px' }}>
                        Criar Conta
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 4, fontSize: '1rem' }}>
                        Preencha os dados abaixo para acessar sua agenda.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {/* Upload de Foto mais limpo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={preview} sx={{ width: 80, height: 80, bgcolor: '#f4f4f5', color: '#a1a1aa' }}>
                                    {!preview && <User size={32} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="foto-paciente" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="foto-paciente">
                                    <IconButton component="span" sx={{ 
                                        position: 'absolute', bottom: -5, right: -5, bgcolor: '#111', color: '#fff', 
                                        width: 32, height: 32, '&:hover': { bgcolor: '#32B5FE' } 
                                    }}>
                                        <Camera size={14} />
                                    </IconButton>
                                </label>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111' }}>Foto de Perfil</Typography>
                                <Typography variant="caption" sx={{ color: '#888' }}>JPG ou PNG (Opcional)</Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Nome Completo" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#888"/></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="CPF" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><CreditCard size={18} color="#888"/></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                    onChange={(e) => setFormData({...formData, cpf: e.target.value})} required />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Telefone" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#888"/></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                    onChange={(e) => setFormData({...formData, telefone: e.target.value})} required />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="E-mail" variant="outlined" type="email"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#888"/></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="Senha" type="password" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} color="#888"/></InputAdornment> }} 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                    onChange={(e) => setFormData({...formData, senha: e.target.value})} required />
                            </Grid>
                        </Grid>

                        <Button fullWidth variant="contained" type="submit" endIcon={<ArrowRight size={18} />}
                            sx={{ 
                                mt: 4, py: 1.8, bgcolor: '#111', color: '#fff', fontSize: '1rem', fontWeight: 600, 
                                borderRadius: '6px', textTransform: 'none', boxShadow: 'none',
                                transition: 'all 0.2s', '&:hover': { bgcolor: '#32B5FE', boxShadow: 'none' }
                            }}>
                            Finalizar Cadastro
                        </Button>
                    </form>

                    <Box sx={{ mt: 5, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Já possui uma conta?{' '}
                            <Button onClick={() => navigate('/login')} sx={{ 
                                fontWeight: 700, color: '#111', p: 0, minWidth: 'auto', textTransform: 'none',
                                '&:hover': { bgcolor: 'transparent', color: '#32B5FE', textDecoration: 'underline' } 
                            }}>
                                Fazer Login
                            </Button>
                        </Typography>
                    </Box>

                </Box>
            </Grid>
        </Grid>
    );
};

export default CadastroPaciente;