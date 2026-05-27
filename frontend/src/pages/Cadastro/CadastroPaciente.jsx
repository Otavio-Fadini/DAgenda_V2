import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, InputAdornment, Avatar, IconButton, Fade, CircularProgress } from '@mui/material';
import { User, Mail, Lock, CreditCard, Camera, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const CadastroPaciente = () => {
    const [formData, setFormData] = useState({ 
        nome: '', cpf: '', email: '', senha: '', telefone: '', 
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
        foto: null 
    });
    const [preview, setPreview] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, foto: reader.result });
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCepChange = async (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        setFormData({ ...formData, cep: value });

        if (value.replace("-", "").length === 8) {
            setBuscandoCep(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${value.replace("-", "")}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
                }
            } finally { setBuscandoCep(false); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        try {
            // Ajuste a rota para o seu endpoint de cadastro completo
            const response = await axios.post('https://dagenda.com.br/api/auth/cadastro-paciente', formData);
            if (response.status === 201) {
                alert("Cadastro realizado com sucesso!");
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao realizar cadastro.");
        } finally { setCarregando(false); }
    };

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', backgroundColor: '#F8FAFC',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' }
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)', p: 2 }}>
            <Fade in={true} timeout={800}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', maxWidth: 700, width: '100%', bgcolor: '#ffffff' }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <img src={logo} alt="DAGENDA" style={{ height: '40px', marginBottom: '8px' }} />
                        <Typography variant="h5" fontWeight={900} color="#0f172a">Crie sua conta</Typography>
                        <Typography variant="body2" color="#64748b">Preencha seus dados para começar</Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={preview} sx={{ width: 90, height: 90, bgcolor: '#E2E8F0', color: '#94A3B8' }}>{!preview && <User size={40} />}</Avatar>
                                <input accept="image/*" type="file" id="foto-paciente" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="foto-paciente">
                                    <IconButton component="span" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#32B5FE', color: 'white', '&:hover': { bgcolor: '#0f172a' } }}><Camera size={16} /></IconButton>
                                </label>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}><TextField fullWidth label="Nome Completo" sx={modernInputStyle} onChange={(e) => setFormData({...formData, nome: e.target.value})} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="CPF" sx={modernInputStyle} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="Telefone" sx={modernInputStyle} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="E-mail" type="email" sx={modernInputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="Senha" type="password" sx={modernInputStyle} onChange={(e) => setFormData({...formData, senha: e.target.value})} required /></Grid>
                            
                            <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="caption" color="#94A3B8">Endereço</Typography></Divider></Grid>
                            
                            <Grid item xs={12} sm={4}><TextField fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} sx={modernInputStyle} InputProps={{ endAdornment: buscandoCep && <CircularProgress size={20}/> }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth label="Rua" value={formData.rua} onChange={(e) => setFormData({...formData, rua: e.target.value})} sx={modernInputStyle} /></Grid>
                            <Grid item xs={12} sm={2}><TextField fullWidth label="Nº" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} sx={modernInputStyle} /></Grid>
                            <Grid item xs={12} sm={5}><TextField fullWidth label="Bairro" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} sx={modernInputStyle} /></Grid>
                            <Grid item xs={12} sm={5}><TextField fullWidth label="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} sx={modernInputStyle} /></Grid>
                            <Grid item xs={12} sm={2}><TextField fullWidth label="UF" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} sx={modernInputStyle} /></Grid>
                        </Grid>

                        <Button fullWidth variant="contained" type="submit" disabled={carregando} sx={{ mt: 4, py: 1.5, borderRadius: '12px', fontWeight: 800, bgcolor: '#0f172a', '&:hover': { bgcolor: '#32B5FE' } }}>
                            {carregando ? <CircularProgress size={24} color="inherit"/> : 'Finalizar Cadastro'}
                        </Button>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default CadastroPaciente;