import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Rating, Fade, Chip, Divider, Stack, CircularProgress } from '@mui/material';
import { Stethoscope, ShieldCheck, CalendarClock, Settings2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const MedicosUnidade = () => {
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarMedicos = async () => {
            setLoading(true);
            try {
                // Chama a rota real do backend que lista os médicos vinculados
                const response = await api.get('/clinica/medicos-unidade');
                setMedicos(response.data);
            } catch (error) {
                console.error("Erro ao carregar médicos vinculados:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarMedicos();
    }, []);

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', mb: 1, letterSpacing: '-1px' }}>
                            Corpo Clínico
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            Gerencie os especialistas vinculados à sua unidade.
                        </Typography>
                    </Box>
                    <Chip 
                        label={`${medicos.length} PROFISSIONAIS`} 
                        sx={{ 
                            fontWeight: 800, 
                            bgcolor: '#F1F5F9', 
                            color: '#64748B', 
                            border: '1px solid #E2E8F0',
                            px: 1, height: 32, borderRadius: '8px'
                        }} 
                    />
                </Box>
                
                {/* ESTADO DE CARREGAMENTO */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>
                            Carregando equipe médica...
                        </Typography>
                    </Box>
                ) : medicos.length === 0 ? (
                    /* ESTADO VAZIO (NENHUM MÉDICO VINCULADO) */
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E2E8F0', bgcolor: 'transparent', mt: 4 }}>
                        <AlertCircle size={50} color="#CBD5E1" style={{ marginBottom: 16 }} strokeWidth={1.5} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748B', mb: 1 }}>Nenhum médico vinculado</Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                            Não há profissionais de saúde atrelados a esta unidade no momento.
                        </Typography>
                    </Paper>
                ) : (
                    /* GRID DE MÉDICOS REAIS */
                    <Grid container spacing={3}>
                        {medicos.map((medico) => (
                            <Grid item xs={12} sm={6} lg={4} xl={3} key={medico.id}>
                                <Paper elevation={0} sx={{ 
                                    p: 4, 
                                    borderRadius: '24px', 
                                    border: '1px solid #F1F5F9', 
                                    bgcolor: 'white', 
                                    textAlign: 'center',
                                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 20px 40px -10px rgba(50, 181, 254, 0.15)',
                                        borderColor: '#32B5FE'
                                    }
                                }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', bgcolor: 'rgba(50, 181, 254, 0.05)' }} />

                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ position: 'relative', width: 90, height: 90, mx: 'auto', mb: 2 }}>
                                            <Avatar sx={{ 
                                                width: 90, height: 90, 
                                                bgcolor: '#FFFFFF', 
                                                color: '#32B5FE',
                                                border: '4px solid #F8FAFC',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                                fontSize: '2rem',
                                                fontWeight: 900
                                            }}>
                                                {/* Exibe a primeira letra do nome, ou o ícone se o nome não existir */}
                                                {medico.nome ? medico.nome[0].toUpperCase() : <Stethoscope size={40} strokeWidth={1.5} />}
                                            </Avatar>
                                            <Box sx={{ position: 'absolute', bottom: -2, right: -2, bgcolor: '#10B981', borderRadius: '50%', p: 0.5, border: '2px solid #FFF', display: 'flex' }}>
                                                <ShieldCheck size={14} color="#FFF" />
                                            </Box>
                                        </Box>

                                        <Typography variant="h6" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                                            {medico.nome}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#32B5FE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.5, display: 'block' }}>
                                            {medico.especialidade}
                                        </Typography>
                                        
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mt: 0.5, display: 'block' }}>
                                            CRM {medico.conselho || 'N/I'}
                                        </Typography>

                                        {/* Avaliações fixas temporariamente, pois a API ainda não retorna a nota */}
                                        <Box sx={{ my: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', py: 1, borderRadius: '12px' }}>
                                            <Rating value={5} readOnly size="small" precision={0.1} sx={{ color: '#F59E0B' }} />
                                            <Typography variant="caption" fontWeight={700} color="#64748B">(Novo)</Typography>
                                        </Box>

                                        <Divider sx={{ borderStyle: 'dashed', borderColor: '#E2E8F0', mb: 3 }} />

                                        <Stack spacing={1.5}>
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                startIcon={<CalendarClock size={18} />}
                                                sx={{ 
                                                    bgcolor: '#0F172A', 
                                                    fontWeight: 800, 
                                                    borderRadius: '12px', 
                                                    textTransform: 'none', 
                                                    color: '#FFFFFF',
                                                    py: 1.2,
                                                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                                                    '&:hover': { bgcolor: '#1E293B' }
                                                }}
                                            >
                                                Ver Agenda
                                            </Button>
                                            <Button 
                                                fullWidth 
                                                variant="outlined" 
                                                startIcon={<Settings2 size={18} />}
                                                sx={{ 
                                                    fontWeight: 800, 
                                                    borderRadius: '12px', 
                                                    textTransform: 'none', 
                                                    color: '#64748B',
                                                    borderColor: '#E2E8F0',
                                                    py: 1.2,
                                                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                                                }}
                                            >
                                                Gerenciar
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Fade>
    );
};

export default MedicosUnidade;