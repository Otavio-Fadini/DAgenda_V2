import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, 
    Button, CircularProgress, Alert, Snackbar, Fade, Avatar, IconButton, 
    Tabs, Tab 
} from '@mui/material';
import { User, MapPin, Phone, Mail, Save, Camera, Lock, Map, FileText, Calendar } from 'lucide-react';

const ConfiguracoesPaciente = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [photoPreview, setPhotoPreview] = useState(null);

    // Adicionado data_nascimento
    const [formData, setFormData] = useState({
        nome: '', cpf: '', telefone: '', email: '', senha: '', foto_perfil: '', data_nascimento: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
    });

    // 1. CARREGAR DADOS DO PACIENTE
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/paciente/perfil'); 
                const data = response.data;
                
                setFormData({
                    nome: data.nome || '',
                    cpf: data.cpf || '',
                    telefone: data.telefone || '',
                    email: data.email || '',
                    data_nascimento: data.data_nascimento || '', // <-- Preenche a data
                    senha: '', 
                    foto_perfil: data.foto_perfil || '',
                    cep: data.cep || '',
                    rua: data.rua || '',
                    numero: data.numero || '',
                    bairro: data.bairro || '',
                    cidade: data.cidade || '',
                    estado: data.estado || ''
                });

                if (data.foto_perfil) {
                    setPhotoPreview(data.foto_perfil);
                }
            } catch (err) {
                showNotification("Erro ao carregar dados.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    // 2. CONVERSÃO DE IMAGEM PARA BASE64
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({ ...prev, foto_perfil: base64String }));
                setPhotoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // 3. BUSCA INTELIGENTE DE CEP (VIACEP)
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
                    showNotification("Endereço encontrado!", "success");
                } else {
                    showNotification("CEP não encontrado.", "error");
                }
            } catch (err) {
                showNotification("Erro ao buscar CEP.", "error");
            } finally {
                setBuscandoCep(false);
            }
        }
    };

    // 4. SALVAR ALTERAÇÕES
    const handleSubmit = async () => {
        setSalvando(true);
        try {
            const dataToSend = { ...formData };
            
            if (!dataToSend.senha || dataToSend.senha.trim() === '') {
                delete dataToSend.senha; 
            }

            await api.put('/paciente/perfil', dataToSend); 
            showNotification("Perfil atualizado com sucesso!", "success");
        } catch (error) {
            showNotification("Erro ao atualizar os dados.", "error");
        } finally {
            setSalvando(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', backgroundColor: '#F8FAFC', transition: 'all 0.2s',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#32B5FE' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' }
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
            <CircularProgress sx={{ color: '#32B5FE' }} />
        </Box>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', p: { xs: 2, md: 4 }, boxSizing: 'border-box' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>Meu Perfil</Typography>
                    <Typography variant="body2" color="#64748B" fontWeight={500}>Gerencie suas informações pessoais e endereço de atendimento.</Typography>
                </Box>
                <Button 
                    variant="contained" onClick={handleSubmit} disabled={salvando}
                    startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                    sx={{ py: 1.5, px: 4, borderRadius: '12px', bgcolor: '#0F172A', fontWeight: 800, color: '#FFFFFF', textTransform: 'none', boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)', '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' } }}
                >
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Box>

            <Tabs 
                value={tabValue} onChange={(e, v) => setTabValue(v)} 
                sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { fontWeight: 800, textTransform: 'none' }, '& .Mui-selected': { color: '#32B5FE !important' }, '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3 } }}
            >
                <Tab icon={<User size={18}/>} iconPosition="start" label="Dados Pessoais" />
                <Tab icon={<Map size={18}/>} iconPosition="start" label="Meu Endereço" />
            </Tabs>

            <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: '24px', border: '1px solid #E2E8F0', p: 4, overflowY: 'auto', bgcolor: 'white' }}>
                <Fade in={true} timeout={400} key={tabValue}>
                    <Box>
                        {tabValue === 0 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #F1F5F9' } }}>
                                    <Box sx={{ position: 'relative', mb: 2 }}>
                                        <Avatar src={photoPreview} sx={{ width: 140, height: 140, fontSize: '3rem', fontWeight: 800, borderRadius: '50%', border: '4px solid #F8FAFC', bgcolor: '#E2E8F0', color: '#64748B' }}>
                                            {!photoPreview && formData.nome ? formData.nome[0] : ''}
                                        </Avatar>
                                        <input accept="image/*" type="file" id="foto-upload" style={{ display: 'none' }} onChange={handlePhotoChange} />
                                        <label htmlFor="foto-upload">
                                            <IconButton component="span" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: '#32B5FE', color: 'white', border: '4px solid #fff', width: 40, height: 40, '&:hover': { bgcolor: '#0F172A' } }}>
                                                <Camera size={18} />
                                            </IconButton>
                                        </label>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" fontWeight={600} sx={{ mt: 1 }}>
                                        Formatos suportados: PNG ou JPG.<br/>Máx. 2MB.
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={9}>
                                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Informações Básicas</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="CPF" disabled value={formData.cpf} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }} helperText="O CPF não pode ser alterado." />
                                        </Grid>
                                        {/* AQUI: O Campo de Data de Nascimento Corrigido e Organizado */}
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth 
                                                type="date" 
                                                label="Data de Nascimento" 
                                                value={formData.data_nascimento} 
                                                onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})} 
                                                
                                                // 1. Usamos endAdornment para colocar o ícone no final do campo de forma organizada
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {/* Usamos o ícone Calendar que você já importou da lucide-react */}
                                                            <Calendar size={18} color="#94A3B8" /> 
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                
                                                sx={{
                                                    ...inputStyle, // Mantém sua estilização de borda e fundo
                                                    
                                                    // 2. Estilos para garantir que o ícone nativo do navegador seja ESCONDIDO
                                                    '& .MuiOutlinedInput-input': {
                                                        paddingRight: '48px', // Espaço para o ícone (ícone + padding)
                                                        '&::-webkit-calendar-picker-indicator': { display: 'none' }, // Esconde o ícone nativo
                                                        '&::-webkit-datetime-edit': { color: formData.data_nascimento ? 'inherit' : 'transparent' }, // Esconde placeholder nativo
                                                        '&:focus::-webkit-datetime-edit': { color: 'inherit' },
                                                    },
                                                    
                                                    // 3. Estilos para garantir que a label tenha espaço e não se sobreponha ao ícone
                                                    '& .MuiInputLabel-root': {
                                                        width: 'calc(100% - 48px)', // Dá espaço para o ícone
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        left: '12px',
                                                    },
                                                    '& .MuiInputLabel-shrink': {
                                                        width: 'auto',
                                                        overflow: 'visible',
                                                        textOverflow: 'unset',
                                                        left: '14px',
                                                    },
                                                }} 
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Telefone / WhatsApp" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                        <Grid item xs={12} md={12}>
                                            <TextField fullWidth label="Nova Senha" type="password" placeholder="Preencha para alterar" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} sx={inputStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} color="#94A3B8"/></InputAdornment> }} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        {tabValue === 1 && (
                            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Endereço Residencial</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField 
                                            fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} 
                                            inputProps={{ maxLength: 9 }} sx={inputStyle} 
                                            InputProps={{ 
                                                startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment>,
                                                endAdornment: buscandoCep && <InputAdornment position="end"><CircularProgress size={20} color="inherit" /></InputAdornment>
                                            }} 
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Rua / Logradouro" value={formData.rua} onChange={(e) => setFormData({...formData, rua: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Complemento" value={formData.complemento} onChange={(e) => setFormData({...formData, complemento: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField fullWidth label="Número" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth label="Bairro" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth label="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField fullWidth label="Estado" inputProps={{ maxLength: 2 }} placeholder="UF" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} sx={inputStyle} />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPaciente;