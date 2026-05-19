import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Grid, CircularProgress, Stack 
} from '@mui/material';
import { Wallet, ArrowUpRight, FileSpreadsheet, TrendingUp, CreditCard } from 'lucide-react';
import api from '../../services/api';

const FinanceiroPaciente = () => {
    const [dados, setDados] = useState({ historico: [], totalInvestido: 0, totalConsultas: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceiro = async () => {
            try {
                const response = await api.get('/paciente/financeiro');
                setDados(response.data);
            } catch (error) {
                console.error("Erro ao carregar financeiro:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFinanceiro();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100%' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Financeiro</Typography>
                <Typography variant="body1" color="text.secondary">Controle seus investimentos em saúde e histórico de pagamentos.</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                {/* CARD PRINCIPAL - TOTAL INVESTIDO */}
                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={0} sx={{ 
                        p: 4, borderRadius: 3, 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: '#FFFFFF',
                        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <Wallet size={120} color="rgba(50, 181, 254, 0.1)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                        
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <TrendingUp size={18} color="#32B5FE" />
                                <Typography variant="overline" sx={{ fontWeight: 800, color: '#32B5FE', letterSpacing: '1px' }}>
                                    Total Investido em Saúde
                                </Typography>
                            </Stack>
                            
                            <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1px', color: '#FFFFFF' }}>
                                R$ {dados.totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 3, width: 'fit-content' }}>
                                <Box sx={{ p: 0.5, bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: 1, display: 'flex' }}>
                                    <ArrowUpRight size={16} color="#10b981" />
                                </Box>
                                <Typography variant="body2" fontWeight={700} sx={{ color: '#cbd5e1' }}>
                                    {dados.totalConsultas} consultas realizadas
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* MÉTODO PREFERENCIAL */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', 
                        flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="caption" fontWeight={800} color="#64748b" sx={{ letterSpacing: 1 }}>MÉTODO UTILIZADO</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <CreditCard size={24} color="#32B5FE" />
                            <Typography variant="h6" fontWeight={800} color="#0f172a">Pix / Cartão</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* TABELA DE EXTRATO */}
            <Paper elevation={3} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fcfcfd' }}>
                    <FileSpreadsheet size={20} color="#32B5FE" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">Extrato Detalhado</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Data</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Descrição</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Método</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Valor</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textAlign: 'center' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dados.historico.length > 0 ? dados.historico.map((pag) => (
                                <TableRow key={pag.id} hover>
                                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{pag.data}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#1e293b' }}>{pag.descricao}</TableCell>
                                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{pag.metodo}</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#0f172a' }}>
                                        R$ {Number(pag.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip 
                                            label={pag.status} 
                                            size="small" 
                                            sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.7rem' }} 
                                        />
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        Nenhum registro financeiro encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default FinanceiroPaciente;