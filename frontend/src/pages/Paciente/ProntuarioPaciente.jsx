import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Divider, Chip, Grid, Button, LinearProgress, CircularProgress, Stack } from '@mui/material';
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
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Meu Prontuário</Typography>
                    <Typography variant="body1" color="text.secondary">Histórico clínico e evoluções médicas integradas.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Download size={18} />}
                    sx={{ bgcolor: '#0f172a', borderRadius: 3, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#32B5FE' }, color: '#FFFFFF' }}
                >
                    Exportar PDF
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Coluna Lateral (KPIs) */}
                <Grid item xs={12} lg={3}>
                    <Stack spacing={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Heart size={16} color="#32B5FE" /> STATUS GERAL
                            </Typography>
                            <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>Saúde Digital</Typography>
                            <LinearProgress variant="determinate" value={historico.length > 0 ? 100 : 20} sx={{ borderRadius: 5, height: 6, bgcolor: '#f1f5f9' }} />
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 2 }}>ALERGIAS CADASTRADAS</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Chip label="Nenhuma Detectada" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>

                {/* Linha do Tempo */}
                <Grid item xs={12} lg={9}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                    ) : historico.length === 0 ? (
                        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 6, border: '2px dashed #cbd5e1' }}>
                            <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
                            <Typography fontWeight={700} color="text.secondary">Nenhum registro médico encontrado.</Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: { xs: 16, md: 32 }, top: 0, bottom: 0, width: '2px', bgcolor: '#e2e8f0' }} />

                            {historico.map((item) => (
                                <Box key={item.id} sx={{ mb: 4, position: 'relative', pl: { xs: 5, md: 8 } }}>
                                    <Box sx={{ position: 'absolute', left: { xs: 8, md: 24 }, top: 24, width: 16, height: 16, borderRadius: '50%', bgcolor: 'white', border: '4px solid #32B5FE', zIndex: 2 }} />

                                    <Paper elevation={0} sx={{ p: 4, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white', '&:hover': { borderColor: '#32B5FE' } }}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={8}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: '#f1f5f9', color: '#32B5FE' }}><Activity size={20}/></Avatar>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={800} color="#0f172a">{item.medico}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                                                            <Clock size={12} /> Realizado em: {item.data}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Typography variant="subtitle2" fontWeight={900} sx={{ mt: 2, color: '#32B5FE' }}>EVOLUÇÃO CLÍNICA:</Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 3 }}>
                                                    {item.notas}
                                                </Typography>

                                                {item.prescricao && (
                                                    <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 3, border: '1px solid #dcfce7' }}>
                                                        <Typography variant="caption" fontWeight={900} color="#166534" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <FileText size={14} /> PRESCRIÇÃO E ORIENTAÇÕES:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>{item.prescricao}</Typography>
                                                    </Box>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 5, border: '1px dashed #cbd5e1', height: '100%' }}>
                                                    <Typography variant="caption" fontWeight={800} color="text.secondary">LOCAL DA CONSULTA</Typography>
                                                    <Typography variant="body2" fontWeight={800} sx={{ mt: 1, color: '#0f172a' }}>{item.clinica}</Typography>
                                                    <Divider sx={{ my: 2 }} />
                                                    <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
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
    );
};

export default ProntuarioPaciente;