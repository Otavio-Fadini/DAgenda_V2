import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, CircularProgress, Fade, Chip, Avatar } from '@mui/material';
import { Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownLeft, FileText, Activity } from 'lucide-react';
import api from '../../services/api';

const FinanceiroProfissional = () => {
    const [lancamentos, setLancamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saldo, setSaldo] = useState(0);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                // Rota que busca os repasses do médico logado
                const response = await api.get('/profissional/financeiro');
                setLancamentos(response.data.lancamentos || []);
                setSaldo(response.data.saldo_total || 0);
            } catch (error) {
                console.error("Erro ao carregar financeiro:", error);
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#32B5FE' }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Processando extrato...</Typography>
        </Box>
    );

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* HEADER */}
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>Extrato Financeiro</Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>Relatório detalhado de seus recebimentos e repasses.</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Download size={18}/>} sx={{ bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1.2, '&:hover': { bgcolor: '#32B5FE' } }}>Exportar PDF</Button>
                </Box>

                {/* CARDS DE SALDO */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ 
                            p: 4, borderRadius: '24px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                            color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)'
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#32B5FE', letterSpacing: '1px' }}>SALDO DISPONÍVEL</Typography>
                            <Typography variant="h3" fontWeight={900} sx={{ mt: 1, letterSpacing: '-1px' }}>R$ {Number(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
                            <Wallet size={120} color="rgba(50, 181, 254, 0.05)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                        </Paper>
                    </Grid>
                </Grid>

                {/* TABELA DE EXTRATO */}
                <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', bgcolor: 'white' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(50, 181, 254, 0.1)', borderRadius: '8px' }}><FileText size={20} color="#32B5FE"/></Box>
                        <Typography variant="h6" fontWeight={800}>Transações Recentes</Typography>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>DATA</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>DESCRIÇÃO</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }} align="right">VALOR BRUTO</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }} align="right">TAXA</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }} align="right">LÍQUIDO</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }} align="center">STATUS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lancamentos.map((row) => (
                                    // No seu map da tabela:
                                    <TableRow key={row.id}>
                                        <TableCell>{row.data} {row.hora}</TableCell>
                                        <TableCell>{row.pac}</TableCell>
                                        <TableCell align="right">R$ {row.valor}</TableCell>
                                        <TableCell align="right" sx={{ color: '#ef4444' }}>R$ {row.taxa}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 900 }}>R$ {row.liquido}</TableCell>
                                        <TableCell align="center">
                                            <Chip label={row.status} size="small" sx={{ fontWeight: 800, borderRadius: 2 }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Fade>
    );
};

export default FinanceiroProfissional;