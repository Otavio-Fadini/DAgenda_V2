import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Stack, 
    CircularProgress, Fade, Chip, Avatar, Select, MenuItem, FormControl 
} from '@mui/material';
import { 
    Wallet, TrendingUp, Download, Building, Activity, Briefcase
} from 'lucide-react';
import api from '../../services/api';

const FinanceiroProfissional = () => {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado do filtro
    const [filtroStatus, setFiltroStatus] = useState('todos');

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            try {
                // Passando o filtro dinamicamente para o backend
                const response = await api.get('/profissional/financeiro', {
                    params: { filtro_status: filtroStatus }
                });
                setDados(response.data || []);
            } catch (error) {
                console.error("Erro ao carregar financeiro:", error);
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, [filtroStatus]); // Recarrega sempre que o filtro mudar

    // Cálculos dinâmicos baseados no retorno da API
    const totalBrutoGerado = dados.reduce((acc, curr) => acc + Number(curr.faturamento_total || 0), 0);
    const saldoLiquido = dados.reduce((acc, curr) => acc + Number(curr.meu_repasse || 0), 0);

    if (loading && dados.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC', gap: 2 }}>
                <CircularProgress sx={{ color: '#32B5FE' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Calculando seus repasses...</Typography>
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
                
                {/* HEADER */}
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#0F172A', letterSpacing: '-1px' }}>Painel Financeiro</Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>Acompanhamento de repasses e faturamento por clínica.</Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Download size={18}/>} 
                        sx={{ 
                            bgcolor: '#0F172A', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1.2, 
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                            '&:hover': { bgcolor: '#32B5FE', transform: 'translateY(-2px)' }, transition: 'all 0.3s' 
                        }}
                    >
                        Exportar Relatório
                    </Button>
                </Box>

                {/* CARDS DE RESUMO */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 4, borderRadius: '24px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                            color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
                            transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(50, 181, 254, 0.15) 0%, rgba(0,0,0,0) 70%)' }} />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#32B5FE', letterSpacing: '1px' }}>MEU REPASSE (LÍQUIDO)</Typography>
                                <Typography variant="h2" fontWeight={900} sx={{ mt: 1, color: 'white', letterSpacing: '-1px' }}>
                                    R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                            <Wallet size={140} color="rgba(50, 181, 254, 0.05)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 4, borderRadius: '24px', border: '1px solid #F1F5F9', bgcolor: '#ffffff',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)', transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.08)' }
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#F0F9FF', color: '#32B5FE', width: 48, height: 48, borderRadius: '12px' }}>
                                    <TrendingUp strokeWidth={2.5}/>
                                </Avatar>
                                <Chip label="Total Produzido" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, borderRadius: '8px' }} />
                            </Stack>
                            <Typography variant="caption" color="#64748B" fontWeight={800} sx={{ letterSpacing: '1px' }}>BRUTO GERADO PARA AS CLÍNICAS</Typography>
                            <Typography variant="h3" fontWeight={900} color="#0F172A" sx={{ mt: 0.5, letterSpacing: '-1px' }}>
                                R$ {totalBrutoGerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* TABELA AGRUPADA POR ORIGEM */}
                <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', bgcolor: 'white', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)' }}>
                    
                    {/* CABEÇALHO DA TABELA COM FILTRO */}
                    <Box sx={{ p: 3.5, borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" fontWeight={900} color="#0F172A">Detalhamento por Origem</Typography>
                        
                        <FormControl size="small" sx={{ minWidth: 260 }}>
                            <Select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                displayEmpty
                                sx={{ 
                                    borderRadius: '12px', bgcolor: '#F8FAFC', fontWeight: 700, color: '#0F172A',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#32B5FE' }
                                }}
                            >
                                <MenuItem value="todos" sx={{ fontWeight: 600 }}>Ambos (Agendados e Concluídos)</MenuItem>
                                <MenuItem value="atendidas" sx={{ fontWeight: 600 }}>Apenas Atendidos (Concluídos)</MenuItem>
                                <MenuItem value="nao_atendidas" sx={{ fontWeight: 600 }}>Pagos Não Atendidos (Agendados)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {loading ? (
                        <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={30} sx={{ color: '#32B5FE' }} />
                        </Box>
                    ) : dados.length === 0 ? (
                        <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                            <Activity size={50} color="#CBD5E1" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <Typography variant="h6" fontWeight={800} color="#64748B">Nenhum repasse encontrado</Typography>
                            <Typography variant="body2" color="#94A3B8" fontWeight={500}>Altere o filtro acima ou aguarde novos agendamentos.</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', py: 2.5 }}>ORIGEM / CLÍNICA</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>ATENDIMENTOS</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>VALOR BRUTO (GERADO)</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: '#10B981', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>MEU REPASSE (LÍQUIDO)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dados.map((row, index) => (
                                        <TableRow key={index} hover sx={{ transition: 'all 0.2s', '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar 
                                                        src={row.foto_perfil} 
                                                        sx={{ 
                                                            width: 44, height: 44,
                                                            bgcolor: row.origem === 'Atendimento Particular' ? '#F0FDF4' : '#F8FAFC', 
                                                            color: row.origem === 'Atendimento Particular' ? '#16A34A' : '#0F172A',
                                                            border: '1px solid #E2E8F0',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        {!row.foto_perfil && (row.origem === 'Atendimento Particular' ? <Briefcase size={20}/> : <Building size={20}/>)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                                                            {row.origem}
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#64748B', textTransform: 'uppercase' }}>
                                                            {row.origem === 'Atendimento Particular' ? 'Consultório Próprio' : 'Clínica Parceira'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={row.total_consultas} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#0F172A', borderRadius: '8px' }} />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>
                                                R$ {Number(row.faturamento_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 900, color: '#10B981', fontSize: '1rem' }}>
                                                R$ {Number(row.meu_repasse).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

export default FinanceiroProfissional;