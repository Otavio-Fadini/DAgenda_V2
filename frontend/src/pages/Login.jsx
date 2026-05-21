import React, { useState } from 'react';
import { 
    Box, Paper, Typography, TextField, Button, 
    ToggleButton, ToggleButtonGroup, InputAdornment, Divider 
} from '@mui/material';
import { Mail, Lock, User, Building2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import logo from '../assets/logo.png'; // Certifique-se de que o caminho está correto

const Login = ({ onLogin }) => {
    const navigate = useNavigate(); 
    const [tipoVisual, setTipoVisual] = useState('cpf'); 
    const [form, setForm] = useState({ email: '', senha: '' });
    const [erro, setErro] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErro('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const response = await axios.post('https://dagenda.com.br/api/auth/login', {
                login: form.email,
                senha: form.senha,
                tipoSelecionado: tipoVisual 
            });

            if (response.data.auth) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userType', usuario.tipo);
                localStorage.setItem('userName', usuario.nome);
                localStorage.setItem('userFoto', usuario.foto || '');

                onLogin({ 
                    token: token, 
                    tipoUsuario: usuario.tipo,
                    nome: usuario.nome,
                    foto: usuario.foto
                });
                navigate('/dashboard');
            }
        } catch (error) {
            const mensagem = error.response?.data?.message || "Erro ao conectar com o servidor";
            setErro(mensagem);
        }
    };

    const handleIrParaCadastro = () => {
        if (tipoVisual === 'cpf') {
            navigate('/cadastro/paciente');
        } else if (tipoVisual === 'cnpj') {
            navigate('/cadastro/clinica');
        } else if (tipoVisual === 'profissional') {
            navigate('/cadastro/profissional');
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', width: '100vw', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'fixed', top: 0, left: 0, zIndex: 2000
        }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 4, md: 6 }, width: '100%', maxWidth: 450, borderRadius: 8, 
                textAlign: 'center', border: '1px solid #e2e8f0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)'
            }}>
                {/* LOGO DO DAGENDA */}
                <Box sx={{ mb: 3 }}>
                    <img src={logo} alt="DAGENDA" style={{ height: '70px', objectFit: 'contain' }} />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 600, letterSpacing: '0.5px' }}>
                    BEM-VINDO AO SISTEMA DE GESTÃO
                </Typography>

                {erro && (
                    <Typography color="error" variant="body2" sx={{ mb: 2, fontWeight: 'bold', bgcolor: '#fef2f2', p: 1.5, borderRadius: 2 }}>
                        {erro}
                    </Typography>
                )}

                <ToggleButtonGroup
                    value={tipoVisual}
                    exclusive
                    onChange={(e, val) => val && setTipoVisual(val)}
                    fullWidth
                    sx={{ 
                        mb: 3,
                        '& .MuiToggleButton-root.Mui-selected': {
                            color: '#32B5FE',
                            backgroundColor: 'rgba(50, 181, 254, 0.08)',
                        }
                    }}
                >
                    <ToggleButton value="cpf" sx={{ gap: 1, textTransform: 'none', fontWeight: 700 }}><User size={18} /> Paciente</ToggleButton>
                    <ToggleButton value="cnpj" sx={{ gap: 1, textTransform: 'none', fontWeight: 700 }}><Building2 size={18} /> Clínica</ToggleButton>
                    <ToggleButton value="profissional" sx={{ gap: 1, textTransform: 'none', fontWeight: 700 }}><Lock size={18} /> Profissional</ToggleButton>
                </ToggleButtonGroup>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth label="E-mail" name="email" margin="normal" variant="filled"
                        onChange={handleChange}
                        InputProps={{ 
                            disableUnderline: true,
                            sx: { borderRadius: 3, bgcolor: '#f1f5f9' },
                            startAdornment: (<InputAdornment position="start"><Mail size={20} color="#94a3b8" /></InputAdornment>) 
                        }}
                    />
                    <TextField
                        fullWidth label="Senha" name="senha" type="password" margin="normal" variant="filled"
                        onChange={handleChange}
                        InputProps={{ 
                            disableUnderline: true,
                            sx: { borderRadius: 3, bgcolor: '#f1f5f9' },
                            startAdornment: (<InputAdornment position="start"><Lock size={20} color="#94a3b8" /></InputAdornment>) 
                        }}
                    />

                    <Button 
                        fullWidth variant="contained" size="large" type="submit"
                        sx={{ 
                            mt: 3, mb: 2, height: 56, borderRadius: 3, fontWeight: 800, 
                            textTransform: 'none', fontSize: '1.1rem', bgcolor: '#0f172a', color: '#FFFFFF',
                            '&:hover': { bgcolor: '#32B5FE' }
                        }}
                    >
                        Entrar no Sistema
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>OU</Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Não tem acesso como <strong>{tipoVisual === 'cpf' ? 'Paciente' : tipoVisual === 'cnpj' ? 'Clínica' : 'Profissional'}</strong>?
                    </Typography>
                    <Button 
                        fullWidth
                        startIcon={<UserPlus size={18} />}
                        onClick={handleIrParaCadastro}
                        sx={{ 
                            mt: 1, 
                            fontWeight: 800, 
                            textTransform: 'none', 
                            color: '#32B5FE',
                            '&:hover': { bgcolor: 'rgba(50, 181, 254, 0.05)' }
                        }}
                    >
                        Criar conta agora
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;