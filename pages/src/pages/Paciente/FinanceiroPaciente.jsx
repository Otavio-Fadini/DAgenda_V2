import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid } from '@mui/material';
import { Wallet, ArrowUpRight, FileSpreadsheet, TrendingUp, CreditCard } from 'lucide-react';

const FinanceiroPaciente = () => {
    const pagamentos = [
        { id: 1, data: '10/05/2026', descricao: 'Consulta Cardiologia', valor: '250,00', status: 'Pago', metodo: 'Cartão de Crédito' },
        { id: 2, data: '15/04/2026', descricao: 'Consulta Clínico Geral', valor: '180,00', status: 'Pago', metodo: 'Pix' },
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100%' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Financeiro</Typography>
                <Typography variant="body1" color="text.secondary">Controle seus investimentos em saúde e histórico de pagamentos.</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={0} sx={{ 
                        p: 4, 
                        borderRadius: 7, 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: '#FFFFFF', // Cor base branca para o papel
                        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Wallet size={120} color="rgba(50, 181, 254, 0.1)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                        
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp size={18} color="#32B5FE" />
                                <Typography variant="overline" sx={{ fontWeight: 800, color: '#32B5FE', letterSpacing: '1px' }}>
                                    Total Investido em Saúde
                                </Typography>
                            </Box>
                            
                            {/* VALOR CORRIGIDO: Cor Branca Pura (#FFFFFF) */}
                            <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1px', color: '#FFFFFF' }}>
                                R$ 430,00
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 3, width: 'fit-content' }}>
                                <Box sx={{ p: 0.5, bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: 1, display: 'flex' }}>
                                    <ArrowUpRight size={16} color="#10b981" />
                                </Box>
                                <Typography variant="body2" fontWeight={700} sx={{ color: '#cbd5e1' }}>
                                    2 consultas realizadas
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4} lg={3}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 7, border: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary">MÉTODO PREFERENCIAL</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <CreditCard size={24} color="#32B5FE" />
                            <Typography variant="h6" fontWeight={800}>Cartão / Pix</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={0} sx={{ borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fcfcfd' }}>
                    <FileSpreadsheet size={20} color="#32B5FE" />
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">Extrato Detalhado</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2.5 }}>Data</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Descrição</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Método</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Valor</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textAlign: 'center' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pagamentos.map((pag) => (
                                <TableRow key={pag.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{pag.data}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#1e293b' }}>{pag.descricao}</TableCell>
                                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{pag.metodo}</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem' }}>R$ {pag.valor}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip 
                                            label={pag.status} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: '#dcfce7', 
                                                color: '#166534', 
                                                fontWeight: 900, 
                                                fontSize: '0.7rem',
                                                px: 1
                                            }} 
                                        />
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

export default FinanceiroPaciente;