import React, { useState } from 'react';
import { 
    Box, Paper, Typography, TextField, Button, 
    ToggleButton, ToggleButtonGroup, InputAdornment, Divider, Fade 
} from '@mui/material';
import { Mail, Lock, User, Building2, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import logo from '../assets/logo.png';

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

    // Estilo customizado e moderno para os Inputs (Padrão do Sistema)
    const modernInputStyle = {};

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            width: '100vw', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)',
            position: 'fixed', 
            top: 0, 
            left: 0, 
            zIndex: 2000
        }}>
            <Fade in={true} timeout={800}>
                <Paper elevation={0} sx={{ 
                    p: { xs: 4, md: 5 }, 
                    width: '100%', 
                    maxWidth: 450, 
                    borderRadius: '24px', 
                    textAlign: 'center', 
                    bgcolor: '#ffffff',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 0 10px rgba(50, 181, 254, 0.05)'
                }}>
                    {/* LOGO DO DAGENDA */}
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={logo} alt="DAGENDA" style={{ height: '48px', objectFit: 'contain', marginBottom: '16px' }} />
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                            Acesso ao Sistema
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
                            Selecione o seu perfil para continuar
                        </Typography>
                    </Box>

                    {erro && (
                        <Fade in={Boolean(erro)}>
                            <Typography variant="body2" sx={{ 
                                mb: 3, fontWeight: 600, color: '#DC2626', bgcolor: '#FEF2F2', 
                                p: 1.5, borderRadius: '8px', borderLeft: '4px solid #DC2626' 
                            }}>
                                {erro}
                            </Typography>
                        </Fade>
                    )}

                    {/* SELEÇÃO DE PERFIL */}
                    <ToggleButtonGroup
                        value={tipoVisual}
                        exclusive
                        onChange={(e, val) => val && setTipoVisual(val)}
                        fullWidth
                        sx={{ 
                            mb: 4,
                            bgcolor: '#F8FAFC',
                            borderRadius: '12px',
                            p: 0.5,
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                borderRadius: '8px !important',
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#64748B',
                                transition: 'all 0.2s',
                            },
                            '& .MuiToggleButton-root.Mui-selected': {
                                color: '#FFFFFF',
                                backgroundColor: '#0F172A',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                '&:hover': {
                                    backgroundColor: '#1E293B',
                                }
                            }
                        }}
                    >
                        <ToggleButton value="cpf" sx={{ gap: 1 }}><User size={18} /> Paciente</ToggleButton>
                        <ToggleButton value="cnpj" sx={{ gap: 1 }}><Building2 size={18} /> Clínica</ToggleButton>
                        <ToggleButton value="profissional" sx={{ gap: 1 }}><Lock size={18} /> Profissional</ToggleButton>
                    </ToggleButtonGroup>

                    {/* FORMULÁRIO DE LOGIN */}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="E-mail" name="email" margin="normal" variant="outlined"
                            onChange={handleChange} sx={modernInputStyle}
                            InputProps={{ 
                                startAdornment: (<InputAdornment position="start"><Mail size={20} color="#94A3B8" /></InputAdornment>) 
                            }}
                        />
                        <TextField
                            fullWidth label="Senha" name="senha" type="password" margin="normal" variant="outlined"
                            onChange={handleChange} sx={{ ...modernInputStyle, mt: 2 }}
                            InputProps={{ 
                                startAdornment: (<InputAdornment position="start"><Lock size={20} color="#94A3B8" /></InputAdornment>) 
                            }}
                        />

                        <Button 
                            fullWidth variant="contained" size="large" type="submit" endIcon={<LogIn size={18} />}
                            sx={{ 
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
                            }}
                        >
                            Entrar na Plataforma
                        </Button>
                    </form>

                    <Divider sx={{ my: 4 }}>
                        <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600 }}>OU</Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Novo por aqui? Crie sua conta de <strong>{tipoVisual === 'cpf' ? 'Paciente' : tipoVisual === 'cnpj' ? 'Clínica' : 'Profissional'}</strong>.
                        </Typography>
                        <Button 
                            fullWidth
                            startIcon={<UserPlus size={18} />}
                            onClick={handleIrParaCadastro}
                            disableRipple
                            sx={{ 
                                mt: 2, 
                                py: 1.5,
                                borderRadius: '12px',
                                fontWeight: 700, 
                                textTransform: 'none', 
                                color: '#32B5FE',
                                border: '2px solid transparent',
                                transition: 'all 0.2s',
                                '&:hover': { 
                                    bgcolor: '#F0F9FF',
                                    borderColor: '#BAE6FD'
                                }
                            }}
                        >
                            Criar minha conta
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default Login;