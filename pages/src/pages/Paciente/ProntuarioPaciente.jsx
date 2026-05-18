import React from 'react';
import { Box, Typography, Paper, Avatar, Divider, Chip, Grid, Button, LinearProgress } from '@mui/material';
import { FileText, Activity, Download, Heart, Clock } from 'lucide-react';

const ProntuarioPaciente = () => {
    const historico = [
        { 
            id: 1, 
            data: '10/05/2026', 
            medico: 'Dr. Ricardo Silva', 
            especialidade: 'Cardiologia', 
            clinica: 'Hospital Santa Rosa',
            notas: 'Paciente apresenta melhora significativa no quadro de hipertensão. O plano medicamentoso atual foi mantido, com recomendação de retorno em 6 meses para novos exames de esforço.', 
            tags: ['Check-up', 'Retorno'],
        },
        { 
            id: 2, 
            data: '15/04/2026', 
            medico: 'Dra. Ana Costa', 
            especialidade: 'Clínico Geral', 
            clinica: 'Clínica Saúde & Vida',
            notas: 'Início de tratamento para rinite sazonal. Prescrito anti-histamínico de uso noturno. Paciente orientado a monitorar crises alérgicas em ambientes fechados.', 
            tags: ['Sintomático'],
        },
    ];

    return (
        <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: '#f8fafc', 
            width: '100%', 
            maxWidth: '100%', // Impede que a tela empurre a sidebar
            boxSizing: 'border-box' 
        }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Heart size={16} color="#32B5FE" /> STATUS GERAL
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>Completude</Typography>
                                <LinearProgress variant="determinate" value={85} sx={{ borderRadius: 5, height: 6, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#32B5FE' } }} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 2 }}>ALERGIAS</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip label="Penicilina" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: '0.65rem' }} />
                                    <Chip label="Lactose" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.65rem' }} />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Coluna da Linha do Tempo */}
                <Grid item xs={12} lg={9}>
                    <Box sx={{ position: 'relative', pt: 1 }}>
                        {/* Linha Vertical Decorativa */}
                        <Box sx={{ position: 'absolute', left: { xs: 16, md: 32 }, top: 0, bottom: 0, width: '2px', bgcolor: '#e2e8f0' }} />

                        {historico.map((item) => (
                            <Box key={item.id} sx={{ mb: 4, position: 'relative', pl: { xs: 5, md: 8 } }}>
                                {/* Ponto da Timeline */}
                                <Box sx={{ 
                                    position: 'absolute', left: { xs: 8, md: 24 }, top: 24, width: 16, height: 16, 
                                    borderRadius: '50%', bgcolor: 'white', border: '4px solid #32B5FE', zIndex: 2 
                                }} />

                                <Paper elevation={0} sx={{ 
                                    p: { xs: 3, md: 4 }, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white',
                                    transition: '0.2s', '&:hover': { borderColor: '#32B5FE', boxShadow: '0 10px 20px rgba(0,0,0,0.04)' }
                                }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: '#f1f5f9', color: '#32B5FE' }}><Activity size={20}/></Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>{item.especialidade}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                        <Clock size={12} /> Atendimento: {item.data}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 2 }}>
                                                {item.notas}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {item.tags.map(tag => (
                                                    <Chip key={tag} label={tag} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20 }} />
                                                ))}
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 5, border: '1px dashed #cbd5e1' }}>
                                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>RESUMO TÉCNICO</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>PROFISSIONAL</Typography>
                                                <Typography variant="body2" fontWeight={800} sx={{ color: '#32B5FE', mb: 1.5 }}>{item.medico}</Typography>
                                                
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>UNIDADE</Typography>
                                                <Typography variant="body2" fontWeight={800} sx={{ mb: 2 }}>{item.clinica}</Typography>
                                                
                                                <Button fullWidth variant="outlined" size="small" startIcon={<FileText size={14} />} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
                                                    Ver Anexo
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProntuarioPaciente;