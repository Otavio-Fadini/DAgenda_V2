import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Stack, 
    IconButton, CardContent, CircularProgress, Avatar, Chip, Fade
} from '@mui/material';
import { 
    DollarSign, TrendingUp, Download, 
    ArrowUpRight, Users, Filter, Activity
} from 'lucide-react';
import api from '../../services/api';

const FinanceiroClinica = () => {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceiro = async () => {
            try {
                // Rota que busca o financeiro consolidado por médico
                const response = await api.get('/clinica/financeiro-geral');
                setDados(response.data);
            } catch (error) {
                console.error("Erro ao carregar dados financeiros");
            } finally {
                setLoading(false);
            }
        };
        fetchFinanceiro();
    }, []);

    // Cálculos Totais baseados no retorno da API
    const totalBruto = dados.reduce((acc, curr) => acc + Number(curr.faturamento_total || 0), 0);
    const totalRepasse = dados.reduce((acc, curr) => acc + Number(curr.repasse_medico || 0), 0);
    const lucroLiquido = totalBruto - totalRepasse;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mt: 2 }}>Calculando fechamento...</Typography>
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* HEADER MODERNO */}
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                            Gestão Financeira
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                            Relatório consolidado de faturamento e fluxo de repasses.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button 
                            variant="outlined" 
                            startIcon={<Download size={18} />}
                            sx={{ 
                                borderRadius: '12px', fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0',
                                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                            }}
                        >
                            Exportar
                        </Button>
                        <Button 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '12px', fontWeight: 800, color: '#FFFFFF', bgcolor: '#0F172A', px: 4, py: 1.2,
                                textTransform: 'none', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                                '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(50, 181, 254, 0.3)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Fechar Competência
                        </Button>
                    </Stack>
                </Box>

                {/* CARDS DE DASHBOARD BANCÁRIO */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ 
                            borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: '#ffffff',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)' }
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#F0F9FF', color: '#32B5FE', width: 48, height: 48, borderRadius: '12px' }}>
                                        <DollarSign strokeWidth={2.5}/>
                                    </Avatar>
                                    <Chip label="+12% que o mês anterior" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800, border: '1px solid #A7F3D0', borderRadius: '8px' }} />
                                </Stack>
                                <Typography variant="caption" color="#64748B" fontWeight={800} sx={{ letterSpacing: '1px' }}>FATURAMENTO BRUTO</Typography>
                                <Typography variant="h3" fontWeight={900} color="#0F172A" sx={{ mt: 0.5, letterSpacing: '-1px' }}>
                                    R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ 
                            borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: '#ffffff',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)' }
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#FFF7ED', color: '#F97316', width: 48, height: 48, borderRadius: '12px' }}>
                                        <Users strokeWidth={2.5} />
                                    </Avatar>
                                    <Typography variant="caption" fontWeight={800} color="#F97316" sx={{ bgcolor: '#FFEDD5', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                                        Repasse Variável
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="#64748B" fontWeight={800} sx={{ letterSpacing: '1px' }}>TOTAL REPASSES (MÉDICOS)</Typography>
                                <Typography variant="h3" fontWeight={900} color="#F97316" sx={{ mt: 0.5, letterSpacing: '-1px' }}>
                                    R$ {totalRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ 
                            borderRadius: '24px', 
                            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 15px 35px -10px rgba(15, 23, 42, 0.4)',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.5)' }
                        }}>
                            {/* Efeito Luminoso de Fundo */}
                            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(50, 181, 254, 0.15) 0%, rgba(0,0,0,0) 70%)' }} />

                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(50, 181, 254, 0.1)', color: '#32B5FE', width: 48, height: 48, borderRadius: '12px' }}>
                                        <TrendingUp strokeWidth={2.5}/>
                                    </Avatar>
                                    <ArrowUpRight size={24} color="#32B5FE" />
                                </Stack>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }} fontWeight={800} letterSpacing="1px">LUCRO LÍQUIDO UNIDADE</Typography>
                                <Typography variant="h3" sx={{color: '#FFFFFF', mt: 0.5, letterSpacing: '-1px'}} fontWeight={900}>
                                    R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Paper>
                    </Grid>
                </Grid>

                {/* TABELA DE REPASSES */}
                <Paper elevation={0} sx={{ 
                    borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', bgcolor: 'white',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                }}>
                    <Box sx={{ p: 3.5, borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={900} color="#0F172A">Detalhamento por Profissional</Typography>
                        <IconButton sx={{ bgcolor: '#F1F5F9', color: '#64748B', borderRadius: '10px', '&:hover': { bgcolor: '#E2E8F0' } }}>
                            <Filter size={18} />
                        </IconButton>
                    </Box>

                    {dados.length === 0 ? (
                        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                            <Activity size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" fontWeight={800} color="#64748B">Nenhuma movimentação financeira</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>Aguarde a finalização de consultas para ver os repasses.</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', py: 2.5 }}>PROFISSIONAL</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>ATENDIMENTOS</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>BRUTO</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#F97316', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>REPASSE MÉDICO</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#10B981', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>LUCRO CLÍNICA</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }} align="center">AÇÃO</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dados.map((row, index) => (
                                        <TableRow key={index} hover sx={{ 
                                            transition: 'all 0.2s', '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#F8FAFC' } 
                                        }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar 
                                                        src={row.foto_perfil} 
                                                        sx={{ 
                                                            width: 44, height: 44, 
                                                            bgcolor: '#F8FAFC', color: '#32B5FE', 
                                                            fontWeight: 900, fontSize: '1rem',
                                                            border: '2px solid #E2E8F0',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        {row.medico ? row.medico[0].toUpperCase() : 'M'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                                                            {row.medico}
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#32B5FE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            Corpo Clínico
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={row.total_consultas} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#0F172A', borderRadius: '8px' }} />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                                                R$ {Number(row.faturamento_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 900, color: '#F97316' }}>
                                                R$ {Number(row.repasse_medico || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 900, color: '#10B981' }}>
                                                R$ {Number(row.lucro_clinica || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button 
                                                    variant="contained" 
                                                    size="small" 
                                                    sx={{ 
                                                        borderRadius: '8px', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: 900, 
                                                        bgcolor: '#F1F5F9', 
                                                        color: '#0F172A',
                                                        boxShadow: 'none',
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#32B5FE', color: 'white', boxShadow: '0 4px 10px rgba(50, 181, 254, 0.3)' }
                                                    }}
                                                >
                                                    PAGAR REPASSE
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>
        </Fade>
    );
};

export default FinanceiroClinica;