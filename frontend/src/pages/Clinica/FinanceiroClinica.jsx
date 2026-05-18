import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Stack, 
    IconButton, Card, CardContent, CircularProgress, Avatar, Chip
} from '@mui/material';
import { 
    DollarSign, TrendingUp, Download, PieChart, 
    ArrowUpRight, Users, Calendar, Filter
} from 'lucide-react';
import api from '../../services/api';

const FinanceiroClinica = () => {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceiro = async () => {
            try {
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

    // Cálculos Totais
    const totalBruto = dados.reduce((acc, curr) => acc + Number(curr.faturamento_total), 0);
    const totalRepasse = dados.reduce((acc, curr) => acc + Number(curr.repasse_medico), 0);
    const lucroLiquido = totalBruto - totalRepasse;

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            
            {/* Header Moderno */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
                        Gestão Financeira
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Relatório consolidado de faturamento e fluxo de repasses.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<Download size={18} />}
                        sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', color: '#64748B', borderColor: '#E2E8F0' }}
                    >
                        Exportar Relatório
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ borderRadius: 3, fontWeight: 800, color: '#FFFFFF', bgcolor: '#0f172a', px: 4, 
                            textTransform: 'none', '&:hover': { bgcolor: '#32B5FE', color: 'white' } }}
                    >
                        Fechar Competência
                    </Button>
                </Stack>
            </Box>

            {/* Cards de Dashboard */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#F0F9FF', color: '#32B5FE' }}><DollarSign /></Avatar>
                                <Chip label="+12%" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700 }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>FATURAMENTO BRUTO</Typography>
                            <Typography variant="h4" fontWeight={900}>R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#FFF7ED', color: '#F97316' }}><Users /></Avatar>
                                <Typography variant="caption" fontWeight={700} color="#F97316">70% Repasse</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>TOTAL REPASSES (MÉDICOS)</Typography>
                            <Typography variant="h4" fontWeight={900} color="#F97316">R$ {totalRepasse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#0F172A', color: 'white' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#32B5FE' }}><TrendingUp /></Avatar>
                                <ArrowUpRight size={20} color="#32B5FE" />
                            </Stack>
                            <Typography variant="caption" sx={{ opacity: 0.7 }} fontWeight={800} sx={{ letterSpacing: 1 }}>LUCRO LÍQUIDO UNIDADE</Typography>
                            <Typography variant="h4" sx={{color: '#FFFFFF'}} fontWeight={900}>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabela de Repasses */}
            <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={900}>Detalhamento por Profissional</Typography>
                    <IconButton size="small"><Filter size={18} /></IconButton>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }}>PROFISSIONAL</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }}>ATENDIMENTOS</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }}>BRUTO</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }}>REPASSE MÉDICO</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }}>LUCRO CLÍNICA</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748B' }} align="center">STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dados.map((row, index) => (
                                <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.2s' }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#0F172A' }}>{row.medico[0]}</Avatar>
                                            <Typography variant="body2" fontWeight={800}>{row.medico}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{row.total_consultas}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>R$ {Number(row.faturamento_total).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#32B5FE' }}>R$ {Number(row.repasse_medico).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>R$ {Number(row.lucro_clinica).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            sx={{ 
                                                borderRadius: 2, 
                                                fontSize: '0.7rem', 
                                                fontWeight: 900, 
                                                bgcolor: '#F1F5F9', 
                                                color: '#0F172A',
                                                '&:hover': { bgcolor: '#32B5FE', color: 'white' }
                                            }}
                                        >
                                            PAGAR
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default FinanceiroClinica;