import React, { useState } from 'react';
import { 
    Box, TextField, Button, Typography, Paper, Grid, InputAdornment, 
    Avatar, IconButton, Fade, CircularProgress, Tabs, Tab, Divider
} from '@mui/material';
import { User, Mail, Lock, CreditCard, Camera, MapPin, Phone, Map, ChevronRight, ChevronLeft, Stethoscope, Info } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const CadastroProfissional = () => {
    const [tabValue, setTabValue] = useState(0); // Controle das Abas
    const [formData, setFormData] = useState({ 
        nome: '', cpf: '', crm: '', especialidade: '', data_nascimento: '', email: '', senha: '', telefone: '', foto_perfil: '',
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

    // Máscara e Busca de CEP
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
            // Formatando a data para o padrão do banco (YYYY-MM-DD) se necessário
            if (dataToSend.data_nascimento && dataToSend.data_nascimento.includes('/')) {
                const [dia, mes, ano] = dataToSend.data_nascimento.split('/');
                dataToSend.data_nascimento = `${ano}-${mes}-${dia}`;
            }

            const response = await axios.post('https://dagenda.com.br/api/auth/cadastro-profissional', dataToSend);
            
            if (response.status === 201) {
                alert("Profissional cadastrado com sucesso!");
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Erro ao realizar cadastro do profissional.");
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
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)',
                p: { xs: 2, sm: 3 },
                boxSizing: 'border-box',
            }}
        >
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: '20px',
                        maxWidth: 650,
                        width: '100%',
                        bgcolor: '#ffffff',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 10px rgba(50, 181, 254, 0.05)',
                    }}
                >
                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={logoImg} alt="DAGENDA" style={{ height: '40px', objectFit: 'contain', marginBottom: '12px' }} />

                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Cadastro Médico
                        </Typography>

                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, textAlign: 'center' }}>
                            Preencha seus dados para configurar sua agenda profissional
                        </Typography>
                    </Box>

                    <Tabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
                        variant="fullWidth"
                        sx={{
                            mb: 3,
                            borderBottom: '1px solid #E2E8F0',
                            '& .MuiTab-root': {
                                fontWeight: 800,
                                textTransform: 'none',
                                fontSize: { xs: '0.78rem', sm: '0.875rem' },
                                minHeight: { xs: 48, sm: 56 },
                                px: { xs: 1, sm: 2 },
                            },
                            '& .Mui-selected': { color: '#32B5FE !important' },
                            '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3 },
                        }}
                    >
                        <Tab icon={<Stethoscope size={18} />} iconPosition="start" label="Dados Profissionais" />
                        <Tab icon={<Map size={18} />} iconPosition="start" label="Endereço" />
                    </Tabs>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {tabValue === 0 && (
                            <Fade in={tabValue === 0}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, position: 'relative' }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                src={preview}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    border: '3px solid #ffffff',
                                                    boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
                                                    bgcolor: '#F1F5F9',
                                                    color: '#94A3B8',
                                                }}
                                            >
                                                {!preview && <User size={32} />}
                                            </Avatar>

                                            <input
                                                accept="image/*"
                                                type="file"
                                                id="foto-profissional"
                                                style={{ display: 'none' }}
                                                onChange={handleImageChange}
                                            />

                                            <label htmlFor="foto-profissional">
                                                <IconButton
                                                    component="span"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        right: -4,
                                                        bgcolor: '#32B5FE',
                                                        color: 'white',
                                                        border: '2px solid #fff',
                                                        width: 30,
                                                        height: 30,
                                                        boxShadow: '0 4px 6px rgba(50,181,254,0.3)',
                                                        '&:hover': { bgcolor: '#0f172a', transform: 'scale(1.05)' },
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Camera size={14} />
                                                </IconButton>
                                            </label>
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Nome Completo"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="CPF"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.cpf}
                                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Data Nasc."
                                                placeholder="DD/MM/AAAA"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.data_nascimento}
                                                onChange={handleDateChange}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="CRM / Registro"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.crm}
                                                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Especialidade"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.especialidade}
                                                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Telefone / WhatsApp"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.telefone}
                                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Senha"
                                                type="password"
                                                variant="outlined"
                                                sx={modernInputStyle}
                                                value={formData.senha}
                                                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="E-mail Profissional"
                                                variant="outlined"
                                                type="email"
                                                sx={modernInputStyle}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                    </Grid>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="button"
                                        onClick={() => setTabValue(1)}
                                        endIcon={<ChevronRight size={18} />}
                                        sx={{
                                            mt: 2,
                                            py: 1.5,
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            bgcolor: '#0f172a',
                                            color: '#FFFFFF',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#32B5FE' },
                                            maxWidth: '340px',
                                        }}
                                    >
                                        Avançar para Endereço
                                    </Button>
                                </Box>
                            </Fade>
                        )}

                        {tabValue === 1 && (
                            <Fade in={tabValue === 1}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 2 }}>
                                    <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="CEP"
                                                value={formData.cep}
                                                onChange={handleCepChange}
                                                inputProps={{ maxLength: 9 }}
                                                sx={modernInputStyle}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={8}>
                                            <TextField
                                                fullWidth
                                                label="Rua / Logradouro"
                                                value={formData.rua}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Número"
                                                value={formData.numero}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={8}>
                                            <TextField
                                                fullWidth
                                                label="Complemento"
                                                value={formData.complemento}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="UF"
                                                inputProps={{ maxLength: 2 }}
                                                value={formData.estado}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Bairro"
                                                value={formData.bairro}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Cidade"
                                                value={formData.cidade}
                                                sx={modernInputStyle}
                                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                                required
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            width: '100%',
                                            borderRadius: '16px',
                                            bgcolor: '#F0F9FF',
                                            border: '1px dashed #BAE6FD',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                            <Box
                                                sx={{
                                                    bgcolor: '#E0F2FE',
                                                    p: 1,
                                                    borderRadius: '12px',
                                                    display: 'inline-flex',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Info size={20} color="#0EA5E9" />
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={900} color="#0369A1" sx={{ mb: 0.5 }}>
                                                    Próximos Passos
                                                </Typography>

                                                <Typography variant="caption" color="#0284C7" fontWeight={600} sx={{ lineHeight: 1.6, display: 'block' }}>
                                                    Após acessar o sistema, vá em Configurações para definir o preço da consulta, duração e convênios aceitos.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, mt: 2, width: '100%', maxWidth: '430px' }}>
                                        <Button
                                            variant="outlined"
                                            type="button"
                                            onClick={() => setTabValue(0)}
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                borderRadius: '10px',
                                                fontWeight: 800,
                                                color: '#64748b',
                                                borderColor: '#E2E8F0',
                                                minWidth: 60,
                                                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                                            }}
                                        >
                                            <ChevronLeft size={20} />
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            type="submit"
                                            disabled={salvando}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: '10px',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                bgcolor: '#0F172A',
                                                color: '#FFFFFF',
                                                '&:hover': { bgcolor: '#32B5FE' },
                                                textTransform: 'none',
                                                boxShadow: '0 10px 20px -10px rgba(50, 181, 254, 0.5)',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            {salvando ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Cadastro'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                    </form>

                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Já possui uma conta?{' '}
                            <Button
                                onClick={() => navigate('/login')}
                                disableRipple
                                sx={{
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    color: '#32B5FE',
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': { background: 'transparent', textDecoration: 'underline' },
                                }}
                            >
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