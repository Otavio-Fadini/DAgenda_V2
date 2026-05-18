import React from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Wallet, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

const FinanceiroClinica = () => {
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%' }}>
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', letterSpacing: '-1.5px' }}>Financeiro Unidade</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Gestão de faturamento bruto e repasses médicos.</Typography>
                </Box>
                <Button variant="contained" sx={{ borderRadius: 3, fontWeight: 800, bgcolor: '#0f172a' }}>Fechar Mês</Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 8, background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: 'white' }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: '#32B5FE' }}>FATURAMENTO BRUTO (MAIO)</Typography>
                        <Typography variant="h2" fontWeight={900} sx={{ mt: 1 }}>R$ 84.250,00</Typography>
                        <Box sx={{ display: 'flex', mt: 3, gap: 4 }}>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>A REPASSAR</Typography>
                                <Typography variant="h6" fontWeight={800}>R$ 52.100,00</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>LUCRO LÍQUIDO</Typography>
                                <Typography variant="h6" fontWeight={800} color="#10b981">R$ 32.150,00</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900 }}>MÉDICO</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>CONSULTAS</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>VALOR TOTAL</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>REPASSE (70%)</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>AÇÃO</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[1, 2].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell sx={{ fontWeight: 800 }}>Dr. Otávio Fadini</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>124</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>R$ 31.000,00</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#32B5FE' }}>R$ 21.700,00</TableCell>
                                <TableCell><Button size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 800 }}>Pagar</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default FinanceiroClinica;