import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Grid, CircularProgress, Stack, Fade 
} from '@mui/material';
import { Wallet, ArrowUpRight, FileSpreadsheet, TrendingUp, CreditCard, Activity } from 'lucide-react';
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

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* CABEÇALHO */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
                        Financeiro
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
                        Controle seus investimentos em saúde e seu histórico de pagamentos.
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 2 }}>
                        <CircularProgress sx={{ color: '#32B5FE' }} size={48} thickness={4} />
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Carregando dados financeiros...</Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={4} sx={{ mb: 5 }}>
                            {/* CARD PRINCIPAL - TOTAL INVESTIDO */}
                            <Grid item xs={12} md={6} lg={5}>
                                <Paper elevation={0} sx={{ 
                                    p: 4, 
                                    borderRadius: '24px', 
                                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                                    color: '#FFFFFF',
                                    boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
                                    position: 'relative', 
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)' }
                                }}>
                                    {/* Efeitos de Fundo */}
                                    <Box sx={{ 
                                        position: 'absolute', top: -50, right: -50, width: 200, height: 200, 
                                        background: 'radial-gradient(circle, rgba(50, 181, 254, 0.15) 0%, rgba(0,0,0,0) 70%)',
                                    }} />
                                    <Wallet size={140} color="rgba(255, 255, 255, 0.03)" style={{ position: 'absolute', right: -20, bottom: -20, transform: 'rotate(-10deg)' }} />
                                    
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                            <Box sx={{ bgcolor: 'rgba(50, 181, 254, 0.2)', p: 1, borderRadius: '10px', display: 'flex' }}>
                                                <TrendingUp size={18} color="#32B5FE" />
                                            </Box>
                                            <Typography variant="overline" sx={{ fontWeight: 800, color: '#94A3B8', letterSpacing: '1px' }}>
                                                Total Investido em Saúde
                                            </Typography>
                                        </Stack>
                                        
                                        <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-1.5px', color: '#FFFFFF' }}>
                                            R$ {dados.totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 4, bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, px: 2, borderRadius: '12px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Box sx={{ p: 0.5, bgcolor: '#ECFDF5', borderRadius: '6px', display: 'flex' }}>
                                                <ArrowUpRight size={16} color="#10B981" />
                                            </Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#E2E8F0' }}>
                                                {dados.totalConsultas} consultas realizadas
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* MÉTODO PREFERENCIAL */}
                            <Grid item xs={12} md={6} lg={4}>
                                <Paper elevation={0} sx={{ 
                                    p: 4, 
                                    borderRadius: '24px', 
                                    border: '1px solid #F1F5F9', 
                                    bgcolor: 'white', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: '#32B5FE', transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(50, 181, 254, 0.15)' }
                                }}>
                                    <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ letterSpacing: '1px', mb: 3 }}>
                                        MÉTODO DE PAGAMENTO
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', display: 'flex', border: '1px solid #E2E8F0' }}>
                                            <CreditCard size={28} color="#0F172A" />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                                                Pix / Cartão
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#32B5FE', fontWeight: 700, mt: 0.5 }}>
                                                Mercado Pago
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* TABELA DE EXTRATO */}
                        <Paper elevation={0} sx={{ 
                            borderRadius: '24px', 
                            border: '1px solid #F1F5F9', 
                            bgcolor: 'white', 
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{ p: 3.5, borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: 'rgba(50, 181, 254, 0.1)', borderRadius: '10px', display: 'flex' }}>
                                    <FileSpreadsheet size={20} color="#32B5FE" />
                                </Box>
                                <Typography variant="h6" fontWeight={800} color="#0F172A">Extrato Detalhado</Typography>
                            </Box>
                            
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', py: 2.5 }}>Data</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Descrição</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Método</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Valor</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dados.historico.length > 0 ? dados.historico.map((pag) => (
                                            <TableRow 
                                                key={pag.id} 
                                                hover 
                                                sx={{ 
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: '#F8FAFC' }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 700, color: '#64748B', py: 2.5 }}>{pag.data}</TableCell>
                                                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>{pag.descricao}</TableCell>
                                                <TableCell sx={{ color: '#64748B', fontWeight: 600 }}>{pag.metodo}</TableCell>
                                                <TableCell sx={{ fontWeight: 900, color: '#0F172A' }}>
                                                    R$ {Number(pag.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip 
                                                        label={pag.status.toUpperCase()} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontWeight: 800, fontSize: '0.7rem', height: 26, px: 1, borderRadius: '8px', letterSpacing: '0.5px',
                                                            bgcolor: pag.status.toLowerCase() === 'aprovado' || pag.status.toLowerCase() === 'pago' ? '#ECFDF5' : '#FEFCE8',
                                                            color: pag.status.toLowerCase() === 'aprovado' || pag.status.toLowerCase() === 'pago' ? '#10B981' : '#EAB308',
                                                            border: '1px solid',
                                                            borderColor: pag.status.toLowerCase() === 'aprovado' || pag.status.toLowerCase() === 'pago' ? '#A7F3D0' : '#FEF08A'
                                                        }} 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                                                        <Activity size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                                                        <Typography variant="subtitle1" fontWeight={800} color="#64748B">Nenhuma transação encontrada</Typography>
                                                        <Typography variant="body2" color="#94A3B8" fontWeight={500}>Seu histórico de pagamentos aparecerá aqui.</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </>
                )}
            </Box>
        </Fade>
    );
};

export default FinanceiroPaciente;