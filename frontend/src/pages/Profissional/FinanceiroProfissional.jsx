import React from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, TextField } from '@mui/material';
import { Wallet, TrendingUp, Download, ArrowUpRight, Search, FileText, Filter, ArrowDownLeft } from 'lucide-react';

const FinanceiroProfissional = () => {
    // Dados simulados com lógica de entrada/saída
    const lancamentos = [
        { id: 1, pac: 'Otávio Augusto', data: '11/05/2026', hora: '14:00', valor: '250,00', taxa: '-25,00', liquido: '225,00', status: 'Liquidado', tipo: 'C' },
        { id: 2, pac: 'Ana Souza', data: '11/05/2026', hora: '15:30', valor: '180,00', taxa: '-18,00', liquido: '162,00', status: 'Pendente', tipo: 'C' },
        { id: 3, pac: 'Mensalidade Plataforma', data: '10/05/2026', hora: '09:00', valor: '150,00', taxa: '0,00', liquido: '150,00', status: 'Pago', tipo: 'D' },
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%', minHeight: '100vh' }}>
            {/* Header Estruturado */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>Extrato Financeiro</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#64748b', fontWeight: 600 }}>Relatório detalhado de transações e repasses líquidos.</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Download size={18}/>} sx={{ borderRadius: 3, px: 3, fontWeight: 700, border: '2px solid #e2e8f0', color: '#475569', textTransform: 'none' }}>Exportar PDF</Button>
                    <Button variant="contained" sx={{ borderRadius: 3, px: 3, fontWeight: 800, bgcolor: '#0f172a', textTransform: 'none', color: '#FFFFFF', '&:hover': { bgcolor: '#32B5FE' } }}>Conciliar Vendas</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                {/* Card de Saldo Principal */}
                <Grid item xs={12} md={6} lg={4}>
                    <Paper elevation={0} sx={{ 
                        p: 4, borderRadius: 8, 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: 'white', position: 'relative', overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)'
                    }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: '#32B5FE', letterSpacing: '2px' }}>SALDO EM CONTA</Typography>
                        <Typography variant="h2" fontWeight={900} sx={{ mt: 1, mb: 4, letterSpacing: '-2px', color: '#FFFFFF' }}>R$ 12.850,40</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button fullWidth sx={{ bgcolor: '#32B5FE', color: 'white', fontWeight: 800, borderRadius: 3 }}>Detalhes</Button>
                        </Box>
                        <Wallet size={160} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', right: -40, bottom: -40 }} />
                    </Paper>
                </Grid>

                {/* Resumo de Indicadores */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" fontWeight={900} color="#64748b" sx={{ letterSpacing: '1px' }}>PREVISÃO PRÓX. 7 DIAS</Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 1, color: '#10b981' }}>+ R$ 2.450,00</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                            <TrendingUp size={16} color="#10b981"/> 
                            <Typography variant="caption" fontWeight={800} color="#10b981">Crescimento de 8%</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Barra de Filtros da Tabela */}
            <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'white' }}>
                <TextField 
                    placeholder="Buscar transação..." 
                    size="small" 
                    InputProps={{ 
                        startAdornment: <Search size={18} color="#94a3b8" style={{marginRight: 8}}/>,
                        sx: { borderRadius: 3, bgcolor: '#f8fafc', border: 'none', width: 300 },
                        disableUnderline: true
                    }}
                    variant="filled"
                />
                <Button startIcon={<Filter size={18}/>} sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}>Filtros Avançados</Button>
            </Paper>

            {/* Tabela de Extrato Profissional */}
            <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 900, color: '#64748b', fontSize: '0.7rem', py: 2 }}>DATA/HORA</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748b', fontSize: '0.7rem' }}>DESCRIÇÃO / PACIENTE</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748b', fontSize: '0.7rem', textAlign: 'right' }}>VALOR BRUTO</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748b', fontSize: '0.7rem', textAlign: 'right' }}>TAXA</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.7rem', textAlign: 'right' }}>VALOR LÍQUIDO</TableCell>
                                <TableCell sx={{ fontWeight: 900, color: '#64748b', fontSize: '0.7rem', textAlign: 'center' }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lancamentos.map((row) => (
                                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a">{row.data}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.hora}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ 
                                                p: 1, borderRadius: 2, 
                                                bgcolor: row.tipo === 'C' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                display: 'flex'
                                            }}>
                                                {row.tipo === 'C' ? <ArrowUpRight size={16} color="#10b981"/> : <ArrowDownLeft size={16} color="#f87171"/>}
                                            </Box>
                                            <Typography variant="body2" fontWeight={800} color="#334155">{row.pac}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: '#64748b' }}>R$ {row.valor}</TableCell>
                                    <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: '#f87171' }}>{row.taxa}</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body1" fontWeight={900} color={row.tipo === 'C' ? '#0f172a' : '#f87171'}>
                                            {row.tipo === 'C' ? '+' : '-'} R$ {row.liquido}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Chip 
                                            label={row.status} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 900, fontSize: '0.65rem', borderRadius: 1.5,
                                                bgcolor: row.status === 'Liquidado' ? '#dcfce7' : row.status === 'Pendente' ? '#fef3c7' : '#f1f5f9',
                                                color: row.status === 'Liquidado' ? '#166534' : row.status === 'Pendente' ? '#92400e' : '#475569'
                                            }} 
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <Button sx={{ fontWeight: 800, color: '#32B5FE', textTransform: 'none' }}>Ver histórico completo</Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default FinanceiroProfissional;