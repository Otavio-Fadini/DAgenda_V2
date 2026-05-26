import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, IconButton, Fade, InputAdornment, Stack, Divider } from '@mui/material';
import { Building2, MapPin, Phone, Mail, Save, Camera, FileText } from 'lucide-react';

const GerenciamentoClinica = () => {
    // Estados simulando os dados da clínica (prontos para conectar com sua API)
    const [formData, setFormData] = useState({
        nomeFantasia: 'DAGENDA - Unidade Araras',
        cnpj: '12.345.678/0001-99',
        endereco: 'Av. Principal, 123 - Centro, Araras - SP',
        telefone: '(19) 99999-9999',
        email: 'contato@dagenda.com.br'
    });
    
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // Estilo customizado e moderno para os Inputs
    const modernInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#32B5FE', borderWidth: '2px' },
            '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(50, 181, 254, 0.1)' }
        }
    };

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
                        Gerenciamento da Clínica
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Configure os dados cadastrais e a identidade visual da sua unidade.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    
                    {/* COLUNA ESQUERDA: DADOS CADASTRAIS */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ 
                            p: { xs: 3, md: 5 }, 
                            borderRadius: '24px', 
                            border: '1px solid #F1F5F9', 
                            bgcolor: 'white',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 4 }}>
                                Informações Cadastrais
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>NOME FANTASIA</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.nomeFantasia}
                                        onChange={(e) => setFormData({...formData, nomeFantasia: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>CNPJ</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>ENDEREÇO COMPLETO</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>TELEFONE / WHATSAPP</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>E-MAIL ADMINISTRATIVO</Typography>
                                    <TextField 
                                        fullWidth variant="outlined" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        sx={modernInputStyle} 
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color="#94A3B8"/></InputAdornment> }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4, borderStyle: 'dashed', borderColor: '#E2E8F0' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Save size={18} />} 
                                    sx={{ 
                                        py: 1.5, px: 4, 
                                        borderRadius: '12px', 
                                        bgcolor: '#0F172A', 
                                        fontWeight: 800, 
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 20px -10px rgba(15, 23, 42, 0.5)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 15px 25px -10px rgba(50, 181, 254, 0.5)' }
                                    }}
                                >
                                    Salvar Alterações
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* COLUNA DIREITA: IDENTIDADE VISUAL */}
                    <Grid item xs={12} lg={4}>
                        <Paper elevation={0} sx={{ 
                            p: { xs: 3, md: 5 }, 
                            borderRadius: '24px', 
                            border: '1px solid #F1F5F9', 
                            bgcolor: 'white',
                            textAlign: 'center',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                                Identidade Visual
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 4 }}>
                                Logomarca da unidade
                            </Typography>

                            <Box sx={{ position: 'relative', mb: 3 }}>
                                <Avatar 
                                    variant="rounded" 
                                    src={preview} 
                                    sx={{ 
                                        width: 160, height: 160, 
                                        borderRadius: '24px',
                                        border: '4px solid #F8FAFC', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
                                        bgcolor: '#F1F5F9',
                                        color: '#94A3B8'
                                    }}
                                >
                                    {!preview && <Building2 size={60} strokeWidth={1.5} />}
                                </Avatar>
                                <input accept="image/*" type="file" id="logo-upload" style={{ display: 'none' }} onChange={handleImageChange} />
                                <label htmlFor="logo-upload">
                                    <IconButton component="span" sx={{ 
                                        position: 'absolute', bottom: -10, right: -10, 
                                        bgcolor: '#32B5FE', color: 'white', 
                                        border: '4px solid #fff', width: 44, height: 44,
                                        boxShadow: '0 4px 10px rgba(50,181,254,0.4)',
                                        '&:hover': { bgcolor: '#0F172A', transform: 'scale(1.05)' },
                                        transition: 'all 0.2s'
                                    }}>
                                        <Camera size={20} />
                                    </IconButton>
                                </label>
                            </Box>

                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', maxWidth: 200, mx: 'auto', mt: 2 }}>
                                Recomendado: Imagem quadrada em formato PNG transparente ou JPG (Máx. 2MB).
                            </Typography>
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Fade>
    );
};

export default GerenciamentoClinica;