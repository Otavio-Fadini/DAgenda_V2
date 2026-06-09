import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Divider, Chip, Grid, Button, LinearProgress, CircularProgress, Stack, Fade } from '@mui/material';
import { FileText, Activity, Download, Heart, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ProntuarioPaciente = () => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarProntuario = async () => {
            try {
                const response = await api.get('/paciente/meu-prontuario');
                setHistorico(response.data);
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
            } finally {
                setLoading(false);
            }
        };
        carregarProntuario();
    }, []);

    return (
        <Fade in={true} timeout={600}>
            <Box className="responsive-page" sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#F8FAFC', minHeight: { xs: '100dvh', md: '100%' }, boxSizing: 'border-box' }}>
                
                {/* HEADER */}
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                            Meu Prontuário
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                            Histórico clínico e evoluções médicas integradas.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Download size={18} />}
                        sx={{ 
                            bgcolor: '#0F172A', 
                            borderRadius: '12px', 
                            fontWeight: 700, 
                            py: 1.2,
                            px: 3,
                            textTransform: 'none', 
                            boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.3)',
                            transition: 'all 0.3s ease',
                            color: '#FFFFFF',
                            '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 10px 20px -4px rgba(50, 181, 254, 0.4)' }
                        }}
                    >
                        Exportar PDF
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    {/* COLUNA LATERAL (KPIs) */}
                    <Grid item xs={12} lg={3}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ 
                                p: 3.5, 
                                borderRadius: '24px', 
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                bgcolor: '#ffffff' 
                            }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                                    <Heart size={16} color="#32B5FE" /> STATUS GERAL
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
                                    Saúde Digital
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={historico.length > 0 ? 100 : 20} 
                                    sx={{ 
                                        borderRadius: '8px', 
                                        height: 8, 
                                        bgcolor: '#F1F5F9',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#32B5FE', borderRadius: '8px' }
                                    }} 
                                />
                            </Paper>

                            <Paper elevation={0} sx={{ 
                                p: 3.5, 
                                borderRadius: '24px', 
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                bgcolor: '#ffffff' 
                            }}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 2.5, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                                    ALERGIAS CADASTRADAS
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip 
                                        label="Nenhuma Detectada" 
                                        size="small" 
                                        sx={{ 
                                            fontWeight: 800, fontSize: '0.7rem', 
                                            bgcolor: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0', borderRadius: '8px'
                                        }} 
                                    />
                                </Box>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* LINHA DO TEMPO (CONTEÚDO PRINCIPAL) */}
                    <Grid item xs={12} lg={9}>
                        {loading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: 2 }}>
                                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Buscando registros médicos...</Typography>
                            </Box>
                        ) : historico.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0', bgcolor: 'transparent' }}>
                                <AlertCircle size={50} color="#CBD5E1" style={{ marginBottom: 16 }} strokeWidth={1.5} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748B', mb: 1 }}>Nenhum registro encontrado</Typography>
                                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>Seu histórico médico aparecerá aqui após suas consultas.</Typography>
                            </Paper>
                        ) : (
                            <Box sx={{ position: 'relative' }}>
                                {/* Linha vertical guia */}
                                <Box sx={{ position: 'absolute', left: { xs: 16, md: 32 }, top: 10, bottom: 20, width: '2px', bgcolor: '#E2E8F0', borderRadius: '2px' }} />

                                {historico.map((item) => (
                                    <Box key={item.id} sx={{ mb: 4, position: 'relative', pl: { xs: 5, md: 8 } }}>
                                        {/* Marcador Luminoso da Timeline */}
                                        <Box sx={{ 
                                            position: 'absolute', left: { xs: 9, md: 25 }, top: 28, 
                                            width: 16, height: 16, borderRadius: '50%', 
                                            bgcolor: '#ffffff', border: '4px solid #32B5FE', zIndex: 2,
                                            boxShadow: '0 0 0 4px rgba(50, 181, 254, 0.15)'
                                        }} />

                                        {/* Cartão de Registro */}
                                        <Paper elevation={0} sx={{ 
                                            p: { xs: 3, md: 4 }, 
                                            borderRadius: '24px', 
                                            border: '1px solid #F1F5F9', 
                                            bgcolor: 'white',
                                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { borderColor: '#32B5FE', boxShadow: '0 15px 35px -10px rgba(50, 181, 254, 0.15)', transform: 'translateY(-4px)' } 
                                        }}>
                                            <Grid container spacing={4}>
                                                
                                                {/* Detalhes da Evolução */}
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                                                        <Avatar sx={{ bgcolor: '#F8FAFC', color: '#64748B', width: 50, height: 50, border: '1px solid #E2E8F0' }}>
                                                            <Activity size={24} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                                                {item.medico}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, mt: 0.5 }}>
                                                                <Clock size={14} color="#94A3B8" /> Realizado em: {item.data}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2, color: '#32B5FE', letterSpacing: '0.5px' }}>
                                                        EVOLUÇÃO CLÍNICA
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.8, mb: 4, mt: 1 }}>
                                                        {item.notas}
                                                    </Typography>

                                                    {item.prescricao && (
                                                        <Box sx={{ p: 2.5, bgcolor: '#ECFDF5', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, letterSpacing: '0.5px' }}>
                                                                <FileText size={16} /> PRESCRIÇÃO E ORIENTAÇÕES
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#065F46', fontWeight: 600, lineHeight: 1.6 }}>
                                                                {item.prescricao}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Grid>

                                                {/* Card Interno de Ações / Local */}
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ 
                                                        p: 3, 
                                                        bgcolor: '#F8FAFC', 
                                                        borderRadius: '16px', 
                                                        border: '1px dashed #CBD5E1', 
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                                                            LOCAL DA CONSULTA
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 800, mt: 1, color: '#0F172A' }}>
                                                            {item.clinica}
                                                        </Typography>
                                                        
                                                        <Divider sx={{ my: 3, borderStyle: 'dashed', borderColor: '#CBD5E1' }} />
                                                        
                                                        <Button 
                                                            fullWidth 
                                                            variant="outlined" 
                                                            sx={{ 
                                                                borderRadius: '10px', 
                                                                fontWeight: 700, 
                                                                textTransform: 'none',
                                                                borderWidth: '2px',
                                                                color: '#32B5FE',
                                                                borderColor: '#32B5FE',
                                                                '&:hover': { borderWidth: '2px', bgcolor: '#F0F9FF', borderColor: '#29A3E5' }
                                                            }}
                                                        >
                                                            Gerar Receita Digital
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
};

export default ProntuarioPaciente;