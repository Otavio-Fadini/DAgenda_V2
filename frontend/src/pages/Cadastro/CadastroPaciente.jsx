import React, { useState } from 'react';
import { 
    Box, TextField, Button, Typography, Paper, Grid, InputAdornment, 
    Avatar, IconButton, Fade, CircularProgress, Divider 
} from '@mui/material';
import { User, Mail, Lock, CreditCard, Camera, MapPin, Calendar as CalendarIcon, Phone } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const CadastroPaciente = () => {
    // Adicionado data_nascimento e foto_perfil
    const [formData, setFormData] = useState({ 
        nome: '', cpf: '', data_nascimento: '', email: '', senha: '', telefone: '', foto_perfil: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
    });
    const [preview, setPreview] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    // Convertendo a imagem para Base64 (Mesmo padrão das configurações)
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

    const handleCepChange = async (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        
        let formatado = value;
        if (value.length > 5) {
            formatado = value.replace(/^(\d{5})(\d)/, "$1-$2");
        }
        
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

    // Máscara para Data de Nascimento (DD/MM/AAAA)
    const handleDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
        
        if (value.length > 8) value = value.slice(0, 8); // Limita a 8 dígitos

        // Adiciona as barras automaticamente
        if (value.length > 4) {
            value = value.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d+)/, "$1/$2");
        }

        setFormData({ ...formData, data_nascimento: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
            // Cria uma cópia dos dados para não alterar o que o usuário está vendo na tela
            const dataToSend = { ...formData };
            
            // Converte de DD/MM/AAAA para AAAA-MM-DD para o banco de dados aceitar
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
        '& .MuiInputBase-input': { padding: '14px' } // Padding padrão para evitar sobreposição
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)', p: 2 
        }}>
            <Fade in={true} timeout={800}>
                <Paper elevation={0} sx={{ 
                    p: { xs: 3, md: 4 }, 
                    borderRadius: '20px', 
                    maxWidth: 650, // Reduzido para ficar mais compacto
                    width: '100%', 
                    bgcolor: '#ffffff',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 10px rgba(50, 181, 254, 0.05)' 
                }}>
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={logo} alt="DAGENDA" style={{ height: '40px', objectFit: 'contain', marginBottom: '12px' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Crie sua conta
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                            Preencha seus dados para acessar o portal
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        {/* Seção da Foto de Perfil */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={preview} sx={{ 
                                    width: 80, height: 80, // Foto um pouco menor
                                    border: '3px solid #ffffff', boxShadow: '0 6px 12px rgba(0,0,0,0.08)', 
                                    bgcolor: '#F1F5F9', color: '#94A3B8'
                                }}>
                                    {!preview && <User size={32} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="foto-paciente" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="foto-paciente">
                                    <IconButton component="span" sx={{ 
                                        position: 'absolute', bottom: 0, right: -4, 
                                        bgcolor: '#32B5FE', color: 'white', border: '2px solid #fff', 
                                        width: 30, height: 30, boxShadow: '0 4px 6px rgba(50,181,254,0.3)',
                                        '&:hover': { bgcolor: '#0f172a', transform: 'scale(1.05)' }, transition: 'all 0.2s'
                                    }}>
                                        <Camera size={14} />
                                    </IconButton>
                                </label>
                            </Box>
                        </Box>

                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>Dados Pessoais</Typography>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Nome Completo" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="CPF" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><CreditCard size={18} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    label="Data de Nascimento" 
                                    placeholder="DD/MM/AAAA"
                                    variant="outlined" 
                                    type="text" 
                                    value={formData.data_nascimento}
                                    sx={modernInputStyle} 
                                    onChange={handleDateChange} 
                                    required 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Telefone / WhatsApp" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Senha" type="password" variant="outlined" 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, senha: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="E-mail" variant="outlined" type="email"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }} 
                                    sx={modernInputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2.5, borderStyle: 'dashed', borderColor: '#E2E8F0' }} />

                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>Endereço</Typography>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={4}>
                                <TextField 
                                    fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} 
                                    inputProps={{ maxLength: 9 }} sx={modernInputStyle} required
                                    InputProps={{ 
                                        startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment>,
                                        endAdornment: buscandoCep && <InputAdornment position="end"><CircularProgress size={16} color="inherit" /></InputAdornment>
                                    }} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField fullWidth label="Rua / Logradouro" value={formData.rua} sx={modernInputStyle} onChange={(e) => setFormData({...formData, rua: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField fullWidth label="Número" value={formData.numero} sx={modernInputStyle} onChange={(e) => setFormData({...formData, numero: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth label="Bairro" value={formData.bairro} sx={modernInputStyle} onChange={(e) => setFormData({...formData, bairro: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField fullWidth label="Cidade" value={formData.cidade} sx={modernInputStyle} onChange={(e) => setFormData({...formData, cidade: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField fullWidth label="UF" inputProps={{ maxLength: 2 }} value={formData.estado} sx={modernInputStyle} onChange={(e) => setFormData({...formData, estado: e.target.value})} required />
                            </Grid>
                        </Grid>

                        <Button fullWidth variant="contained" type="submit" disabled={salvando} sx={{ 
                            mt: 4, py: 1.5, 
                            borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                            bgcolor: '#0f172a', color: '#FFFFFF', textTransform: 'none',
                            boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)', transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: '#32B5FE', boxShadow: '0 10px 20px -10px rgba(50, 181, 254, 0.6)', transform: 'translateY(-2px)' }
                        }}>
                            {salvando ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Cadastro'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Já possui uma conta? {' '}
                            <Button onClick={() => navigate('/login')} disableRipple sx={{ 
                                fontWeight: 800, textTransform: 'none', color: '#32B5FE', p: 0, minWidth: 'auto',
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

export default CadastroPaciente;