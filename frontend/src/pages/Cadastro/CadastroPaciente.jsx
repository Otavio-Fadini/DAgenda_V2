import React, { useState } from 'react';
import { 
    Box, TextField, Button, Typography, Paper, Grid, InputAdornment, 
    Avatar, IconButton, Fade, CircularProgress, Tabs, Tab 
} from '@mui/material';
import { User, Mail, Lock, CreditCard, Camera, MapPin, Phone, Map, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const CadastroPaciente = () => {
    const [tabValue, setTabValue] = useState(0); // Controle das Abas
    const [formData, setFormData] = useState({ 
        nome: '', cpf: '', data_nascimento: '', email: '', senha: '', telefone: '', foto_perfil: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
    });
    const [preview, setPreview] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({ ...prev, foto_perfil: base64String }));
                setPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Máscara para Data de Nascimento (DD/MM/AAAA)
    const handleDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        if (value.length > 8) value = value.slice(0, 8); 
        if (value.length > 4) {
            value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
        }
        setFormData({ ...formData, data_nascimento: value });
    };

    const handleCepChange = async (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        let formatado = value;
        if (value.length > 5) formatado = value.replace(/^(\d{5})(\d)/, "$1-$2");
        setFormData({ ...formData, cep: formatado });

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
                }
            } catch (err) {
                console.error("Erro ao buscar CEP.", err);
            } finally {
                setBuscandoCep(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
            const dataToSend = { ...formData };
            if (dataToSend.data_nascimento && dataToSend.data_nascimento.includes('/')) {
                const [dia, mes, ano] = dataToSend.data_nascimento.split('/');
                dataToSend.data_nascimento = `${ano}-${mes}-${dia}`;
            }

            const response = await axios.post('https://dagenda.com.br/api/auth/cadastro-paciente', dataToSend);
            
            if (response.status === 201) {
                alert("Paciente cadastrado com sucesso!");
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erro ao realizar cadastro do paciente.");
        } finally {
            setSalvando(false);
        }
    };

    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        },
        '& .MuiInputBase-input': { padding: '14px' } 
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
                    p: { xs: 3, md: 4 }, 
                    borderRadius: '20px', 
                    maxWidth: 550, 
                    width: '100%', 
                    bgcolor: '#ffffff',
                    // Aumentamos o gap global aqui para dar respiro aos elementos
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)' 
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                        <img src={logo} alt="DAGENDA" style={{ height: '40px', objectFit: 'contain', marginBottom: '12px' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            Crie sua conta
                        </Typography>
                    </Box>

                    <Tabs 
                        value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth"
                        sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 800, textTransform: 'none' }, '& .Mui-selected': { color: '#32B5FE !important' } }}
                    >
                        <Tab icon={<User size={18}/>} iconPosition="start" label="Dados" />
                        <Tab icon={<Map size={18}/>} iconPosition="start" label="Endereço" />
                    </Tabs>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {tabValue === 0 && (
                            <Fade in={true}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* Foto centralizada */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Avatar src={preview} sx={{ width: 80, height: 80, bgcolor: '#F1F5F9' }}>{!preview && <User size={32} />}</Avatar>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12}><TextField fullWidth label="Nome Completo" sx={modernInputStyle} value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="CPF" sx={modernInputStyle} value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Data Nasc." placeholder="DD/MM/AAAA" sx={modernInputStyle} value={formData.data_nascimento} onChange={handleDateChange} required /></Grid>
                                        <Grid item xs={12}><TextField fullWidth label="E-mail" type="email" sx={modernInputStyle} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Telefone" sx={modernInputStyle} value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Senha" type="password" sx={modernInputStyle} value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} required /></Grid>
                                    </Grid>

                                    <Button fullWidth variant="contained" onClick={() => setTabValue(1)} sx={{ mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 800, bgcolor: '#0f172a' }}>
                                        Avançar
                                    </Button>
                                </Box>
                            </Fade>
                        )}

                        {tabValue === 1 && (
                            <Fade in={true}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}><TextField fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} sx={modernInputStyle} required /></Grid>
                                        <Grid item xs={12}><TextField fullWidth label="Rua" value={formData.rua} sx={modernInputStyle} onChange={(e) => setFormData({...formData, rua: e.target.value})} required /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="Número" value={formData.numero} sx={modernInputStyle} onChange={(e) => setFormData({...formData, numero: e.target.value})} required /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="UF" value={formData.estado} sx={modernInputStyle} onChange={(e) => setFormData({...formData, estado: e.target.value})} required /></Grid>
                                        <Grid item xs={12}><TextField fullWidth label="Cidade" value={formData.cidade} sx={modernInputStyle} onChange={(e) => setFormData({...formData, cidade: e.target.value})} required /></Grid>
                                    </Grid>
                                    
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        <Button fullWidth variant="outlined" onClick={() => setTabValue(0)}>Voltar</Button>
                                        <Button fullWidth variant="contained" type="submit" disabled={salvando} sx={{ bgcolor: '#32B5FE' }}>
                                            {salvando ? <CircularProgress size={24} /> : 'Finalizar'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default CadastroPaciente;