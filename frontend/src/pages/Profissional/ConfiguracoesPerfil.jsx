import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Box, Typography, Paper, Grid, TextField, InputAdornment, Switch, 
    Button, CircularProgress, Alert, Snackbar, Divider, Avatar, IconButton, Tabs, Tab, Stack 
} from '@mui/material';
import { DollarSign, Clock, Shield, User, Briefcase, FileText, Camera, Lock, Calendar, Save, Building2, MapPin, EyeOff, Phone, Mail } from 'lucide-react';

const ConfiguracoesPerfil = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        nome: '', email: '', conselho: '', especialidade: '', cpf: '', data_nascimento: '',
        valor_consulta: '', duracao_sessao: '', atende_convenio: false, telefone: '',
        aceita_convites: true, senha: '', foto_perfil: '', 
        cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
    });

    const [horarios, setHorarios] = useState([
        { dia: 'Segunda', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Terça', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quarta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Quinta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sexta', ativo: true, inicio: '08:00', fim: '18:00' },
        { dia: 'Sábado', ativo: false, inicio: '08:00', fim: '12:00' },
        { dia: 'Domingo', ativo: false, inicio: '08:00', fim: '12:00' }
    ]);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/profissional/perfil');
                const data = response.data;
                
                setFormData({
                    nome: data.nome || '',
                    email: data.email || '',
                    conselho: data.conselho || '',
                    especialidade: data.especialidade || '',
                    cpf: data.cpf || '',
                    data_nascimento: data.data_nascimento ? data.data_nascimento.substring(0, 10) : '',
                    valor_consulta: data.valor_consulta || '',
                    duracao_sessao: data.duracao_sessao || '30',
                    atende_convenio: data.atende_convenio === 1 || data.atende_convenio === true,
                    aceita_convites: data.aceita_convites !== 0,
                    telefone: data.telefone || '',
                    senha: '',
                    foto_perfil: data.foto_perfil || '',
                    cep: data.cep || '',
                    rua: data.rua || '',
                    numero: data.numero || '',
                    complemento: data.complemento || '',
                    bairro: data.bairro || '',
                    cidade: data.cidade || '',
                    estado: data.estado || ''
                });

                if (data.horarios && data.horarios.length > 0) {
                    const mapeados = data.horarios.map(h => ({
                        dia: h.dia,
                        ativo: h.ativo === 1 || h.ativo === true,
                        inicio: h.inicio ? h.inicio.substring(0, 5) : '08:00',
                        fim: h.fim ? h.fim.substring(0, 5) : '18:00'
                    }));
                    
                    const diasOrdenados = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                    const horariosCompletos = diasOrdenados.map(diaNome => {
                        const encontrado = mapeados.find(m => m.dia.toLowerCase().includes(diaNome.toLowerCase().substring(0, 3)));
                        return encontrado || { dia: diaNome, ativo: false, inicio: '08:00', fim: '18:00' };
                    });
                    setHorarios(horariosCompletos);
                }
                
                if (data.foto_perfil) {
                    setPhotoPreview(data.foto_perfil);
                }
            } catch (err) {
                showNotification("Erro ao carregar dados", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, foto_perfil: reader.result }));
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHorarioChange = (index, field, value) => {
        const novosHorarios = [...horarios];
        novosHorarios[index][field] = value;
        setHorarios(novosHorarios);
    };

    const handlePrivacyToggle = async (e) => {
        const isAtivo = e.target.checked;
        setFormData({ ...formData, aceita_convites: isAtivo });
        
        try {
            await api.put('/profissional/config-privacidade', { aceita_convites: isAtivo ? 1 : 0 });
            showNotification(isAtivo ? "Agora está visível para convites!" : "Perfil oculto para convites.", "success");
        } catch (error) {
            console.error(error);
            showNotification("Erro ao atualizar privacidade.", "error");
            setFormData({ ...formData, aceita_convites: !isAtivo });
        }
    };

    // Busca o CEP na API dos Correios/ViaCEP
    const buscarCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, ''); // Remove o traço
        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    rua: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    estado: data.uf || ''
                }));
                showNotification("Endereço preenchido automaticamente!", "success");
            } else {
                showNotification("CEP não encontrado.", "error");
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            showNotification("Erro ao consultar o serviço de CEP.", "error");
        }
    };

    // Aplica a máscara e dispara a busca
    const handleCepChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Só aceita números
        
        // Aplica a máscara visual XXXXX-XXX
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        
        setFormData(prev => ({ ...prev, cep: value }));

        // Se chegou a 8 números, dispara a busca automática
        if (value.replace(/\D/g, '').length === 8) {
            buscarCep(value);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = { ...formData, horarios };
            if (!dataToSend.senha || dataToSend.senha.trim() === '') {
                delete dataToSend.senha;
            }

            await api.put('/profissional/perfil', dataToSend);
            showNotification("Configurações atualizadas com sucesso!", "success");
        } catch (err) {
            showNotification("Falha ao salvar alterações", "error");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => setNotification({ open: true, message, type });
    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#F8FAFC' } };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress sx={{ color: '#32B5FE' }} /></Box>
    );

    return (
        <Box
            className="configuracoes-perfil responsive-page"
            sx={{
                height: { xs: 'auto', md: 'calc(100vh - 64px)' },
                minHeight: { xs: '100dvh', md: 'auto' },
                overflow: { xs: 'visible', md: 'hidden' },
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#F8FAFC',
                p: { xs: 2, sm: 3, md: 4 },
                boxSizing: 'border-box',
                minWidth: 0
            }}
        >
            
            {/* TOPO FIXO */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'center', sm: 'center' },
                    textAlign: { xs: 'center', sm: 'left' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 3,
                    minWidth: 0
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>Configurações</Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>Gerencie sua identidade, agenda institucional e regras de negócio.</Typography>
                </Box>
                <Button 
                    variant="contained" onClick={handleSubmit} disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                    sx={{ bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, textTransform: 'none', color: '#FFFFFF', width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: '#32B5FE' } }}
                >
                    Salvar Alterações
                </Button>
            </Box>

            {/* ABAS */}
            <Tabs 
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ mb: 3, borderBottom: '1px solid #E2E8F0', maxWidth: '100%', '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: { xs: '0.85rem', sm: '1rem' }, color: '#64748B', minHeight: 48 }, '& .Mui-selected': { color: '#32B5FE !important' }, '& .MuiTabs-indicator': { backgroundColor: '#32B5FE', height: 3, borderRadius: '3px 3px 0 0' } }}
            >
                <Tab icon={<User size={18}/>} iconPosition="start" label="Perfil Profissional" />
                <Tab icon={<Calendar size={18}/>} iconPosition="start" label="Grade de Atendimento" />
                <Tab icon={<DollarSign size={18}/>} iconPosition="start" label="Financeiro & Regras" />
                <Tab icon={<MapPin size={18}/>} iconPosition="start" label="Endereço" />
            </Tabs>

            {/* PAINEL INTERNO AUTO-CONTAINER (EVITA SCROLL GLOBAL) */}
            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    borderRadius: { xs: '18px', md: '24px' },
                    border: '1px solid #E2E8F0',
                    p: { xs: 2, sm: 3, md: 4 },
                    overflowY: { xs: 'visible', md: 'auto' },
                    overflowX: 'hidden',
                    bgcolor: 'white',
                    boxSizing: 'border-box',
                    minWidth: 0
                }}
            >
                
                {/* ABA 0: IDENTIDADE VISUAL E DADOS */}
                {tabValue === 0 && (
                    <Grid container spacing={4} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        
                        {/* === LADO ESQUERDO: FOTO DO PROFISSIONAL === */}
                        <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #F1F5F9' }, pb: { xs: 4, md: 0 } }}>
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar src={photoPreview} sx={{ width: 140, height: 140, fontSize: '3rem', bgcolor: '#0F172A', border: '4px solid #F8FAFC', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                    {!photoPreview && formData.nome ? formData.nome[0] : ''}
                                </Avatar>
                                <IconButton component="label" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: '#32B5FE', color: 'white', '&:hover': { bgcolor: '#0F172A' }, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                    <Camera size={18} />
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary" textAlign="center" fontWeight={600}>
                                Formatos: JPG, PNG.<br/>Processamento Base64 automático.
                            </Typography>
                        </Grid>
                        
                        {/* === LADO DIREITO: FORMULÁRIO BLINDADO COM CSS GRID === */}
                        <Grid item xs={12} md={9} sx={{ alignItems: { xs: 'center', md: 'stretch' }, textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>
                                Dados Principais
                            </Typography>

                            <Box sx={{
                                display: 'grid',
                                gap: { xs: 2, sm: 3 },
                                gridTemplateColumns: { xs: 'minmax(0, 430px)', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
                                justifyContent: { xs: 'center', sm: 'stretch' },
                                width: '100%',
                                minWidth: 0
                            }}>
                                
                                {/* LINHA 1 (Nome ocupa tudo) */}
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <TextField 
                                        fullWidth 
                                        label="Nome Completo" 
                                        value={formData.nome} 
                                        onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                                        sx={inputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Box>

                                {/* LINHA 2 (Documentos Básicos) */}
                                <TextField 
                                    fullWidth 
                                    label="CPF" 
                                    value={formData.cpf} 
                                    onChange={(e) => setFormData({...formData, cpf: e.target.value})} 
                                    sx={inputStyle} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }} 
                                />

                                <TextField 
                                    fullWidth 
                                    type="date" 
                                    label="Data de Nascimento" 
                                    value={formData.data_nascimento} 
                                    onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})} 
                                    InputLabelProps={{ shrink: true }} 
                                    sx={{
                                        ...inputStyle, 
                                        '& input::-webkit-datetime-edit': { color: formData.data_nascimento ? 'inherit' : 'transparent' },
                                        '& input:focus::-webkit-datetime-edit': { color: 'inherit' }
                                    }} 
                                />

                                {/* LINHA 3 (Contatos - Telefone e Email juntos!) */}
                                <TextField 
                                    fullWidth 
                                    label="Telefone / WhatsApp" 
                                    value={formData.telefone} 
                                    onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
                                    sx={inputStyle} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }} 
                                />

                                <TextField 
                                    fullWidth 
                                    label="E-mail de Acesso" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    sx={inputStyle} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }}
                                />

                                {/* LINHA 4 (Dados Profissionais) */}
                                <TextField 
                                    fullWidth 
                                    label="Inscrição no Conselho (Ex: CRM-SP)" 
                                    value={formData.conselho} 
                                    onChange={(e) => setFormData({...formData, conselho: e.target.value})} 
                                    sx={inputStyle} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }} 
                                />

                                <TextField 
                                    fullWidth 
                                    label="Especialidade Principal" 
                                    value={formData.especialidade} 
                                    onChange={(e) => setFormData({...formData, especialidade: e.target.value})} 
                                    sx={inputStyle} 
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18} color="#94A3B8"/></InputAdornment> }} 
                                />

                                {/* LINHA 5 (Segurança - Ocupa a linha toda no final) */}
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <TextField 
                                        fullWidth 
                                        label="Nova Senha de Segurança" 
                                        type="password" 
                                        placeholder="Preencha apenas se desejar alterar a atual" 
                                        value={formData.senha} 
                                        onChange={(e) => setFormData({...formData, senha: e.target.value})} 
                                        sx={inputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} color="#94A3B8"/></InputAdornment> }} 
                                    />
                                </Box>

                            </Box>
                        </Grid>

                    </Grid>
                )}

                {/* ABA 1: DISPONIBILIDADE CALENDLY STYLE */}
                {tabValue === 1 && (
                    <Box sx={{ width: '100%', maxWidth: { xs: 430, md: 720 }, mx: 'auto', minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Dias e Janelas de Atendimento</Typography>
                        {horarios.map((h, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 2,
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: '16px',
                                    border: h.ativo ? '1px solid #32B5FE' : '1px solid #E2E8F0',
                                    bgcolor: h.ativo ? 'rgba(50, 181, 254, 0.02)' : '#F8FAFC',
                                    transition: 'all 0.2s',
                                    minWidth: 0
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 160 }, minWidth: 0 }}>
                                    <Switch checked={h.ativo} onChange={(e) => handleHorarioChange(index, 'ativo', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#32B5FE' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#32B5FE' } }} />
                                    <Typography fontWeight={800} color={h.ativo ? '#0F172A' : '#94A3B8'}>{h.dia}</Typography>
                                </Stack>
                                
                                {h.ativo ? (
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap', rowGap: 1 }}>
                                        <TextField size="small" value={h.inicio} onChange={(e) => handleHorarioChange(index, 'inicio', e.target.value)} sx={{ width: 110, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }} />
                                        <Typography color="#94A3B8" fontWeight={800} variant="caption">ATÉ</Typography>
                                        <TextField size="small" value={h.fim} onChange={(e) => handleHorarioChange(index, 'fim', e.target.value)} sx={{ width: 110, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }} />
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" fontWeight={700} color="#94A3B8" sx={{ pr: 4 }}>Indisponível</Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* ABA 2: REGRA DE NEGÓCIO FINANCEIRO */}
                {tabValue === 2 && (
                    <Grid container spacing={3} sx={{ width: '100%', maxWidth: { xs: 430, md: 720 }, mx: 'auto', minWidth: 0, justifyContent: 'center' }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ mb: 1 }}>Preço Comercial da Consulta</Typography>
                            <TextField fullWidth value={formData.valor_consulta} onChange={(e) => setFormData({...formData, valor_consulta: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={18} color="#32B5FE"/></InputAdornment> }} sx={inputStyle} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={800} color="#64748B" sx={{ mb: 1 }}>Tempo Estimado da Sessão (Minutos)</Typography>
                            <TextField fullWidth value={formData.duracao_sessao} onChange={(e) => setFormData({...formData, duracao_sessao: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18} color="#32B5FE"/></InputAdornment> }} sx={inputStyle} />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, p: 3, borderRadius: '20px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderRadius: '10px', color: '#16A34A', display: 'flex' }}><Shield size={20} /></Box>
                                    <Box>
                                        <Typography fontWeight={800} color="#166534">Credenciamento de Operadoras</Typography>
                                        <Typography variant="caption" color="#15803D" fontWeight={600}>Habilitar recepção e listagem automática de convênios médicos parceiros.</Typography>
                                    </Box>
                                </Stack>
                                <Switch checked={formData.atende_convenio} onChange={(e) => setFormData({...formData, atende_convenio: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16A34A' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#16A34A' } }} />
                            </Box>
                        </Grid>
                        {/* O NOVO BLOCO DE PRIVACIDADE ENTRA AQUI */}
                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, p: 3, borderRadius: '20px', bgcolor: formData.aceita_convites ? '#F0FDF4' : '#FEF2F2', border: '1px solid', borderColor: formData.aceita_convites ? '#BBF7D0' : '#FECACA', display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, transition: 'all 0.3s' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: formData.aceita_convites ? '#DCFCE7' : '#FEE2E2', borderRadius: '10px', color: formData.aceita_convites ? '#16A34A' : '#EF4444', display: 'flex' }}>
                                        <Building2 size={20} />
                                    </Box>
                                    <Box>
                                        <Typography fontWeight={800} color={formData.aceita_convites ? '#166534' : '#991B1B'}>
                                            Receber Convites de Clínicas
                                        </Typography>
                                        <Typography variant="caption" color={formData.aceita_convites ? '#15803D' : '#B91C1C'} fontWeight={600}>
                                            {formData.aceita_convites ? 'O seu perfil aparece nas buscas de clínicas da sua região.' : 'O seu perfil está bloqueado e invisível nas buscas.'}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Switch 
                                    checked={formData.aceita_convites} 
                                    onChange={handlePrivacyToggle} 
                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#16A34A' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#16A34A' } }} 
                                />
                            </Box>
                        </Grid>
                    </Grid>
                )}
                {/* ABA 3: ENDEREÇO */}
                {tabValue === 3 && (
                    <Box sx={{ width: '100%', maxWidth: { xs: 430, md: 720 }, mx: 'auto', minWidth: 0, textAlign: { xs: 'center', md: 'left' } }}>
                        <Alert icon={<EyeOff size={22} />} severity="info" sx={{ mb: 4, borderRadius: '16px', '& .MuiAlert-message': { width: '100%' }, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' }}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>Privacidade Garantida</Typography>
                            <Typography variant="body2" fontWeight={500}>O seu endereço não será exibido no seu perfil público nem para clínicas ou pacientes. Ele é utilizado <strong>exclusivamente</strong> pelo nosso algoritmo para conectar o seu perfil a oportunidades em clínicas próximas de si.</Typography>
                        </Alert>

                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={4}><TextField fullWidth label="CEP" value={formData.cep} onChange={handleCepChange} inputProps={{ maxLength: 9 }} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={8}><TextField fullWidth label="Endereço / Rua" value={formData.rua} onChange={(e) => setFormData({...formData, rua: e.target.value})} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={4}><TextField fullWidth label="Número" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={8}><TextField fullWidth label="Complemento" value={formData.complemento} onChange={(e) => setFormData({...formData, complemento: e.target.value})} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={5}><TextField fullWidth label="Bairro" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={5}><TextField fullWidth label="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} sx={inputStyle} /></Grid>
                            <Grid item xs={12} md={2}><TextField fullWidth label="UF" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} sx={inputStyle} /></Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={notification.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ConfiguracoesPerfil;