import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar } from '@mui/material';
import { Building2, MapPin, Phone, Mail, Save } from 'lucide-react';

const GerenciamentoClinica = () => {
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%' }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-1.5px' }}>Gerenciamento da Clínica</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 4 }}>Dados cadastrais e identidade visual da unidade.</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={900} color="#64748b">NOME FANTASIA</Typography>
                                <TextField fullWidth variant="filled" defaultValue="DAGENDA - Unidade Araras" InputProps={{ disableUnderline: true, sx: { borderRadius: 3, bgcolor: '#f8fafc', mt: 1, fontWeight: 800 } }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={900} color="#64748b">CNPJ</Typography>
                                <TextField fullWidth variant="filled" defaultValue="12.345.678/0001-99" InputProps={{ disableUnderline: true, sx: { borderRadius: 3, bgcolor: '#f8fafc', mt: 1, fontWeight: 800 } }} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight={900} color="#64748b">ENDEREÇO COMPLETO</Typography>
                                <TextField fullWidth variant="filled" placeholder="Av. Principal, 123 - Centro" InputProps={{ disableUnderline: true, sx: { borderRadius: 3, bgcolor: '#f8fafc', mt: 1, fontWeight: 700 } }} />
                            </Grid>
                        </Grid>
                        <Button variant="contained" startIcon={<Save/>} sx={{ mt: 5, py: 2, px: 6, borderRadius: 4, bgcolor: '#0f172a', fontWeight: 900, color: '#FFFFFF' }}>Salvar Dados</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GerenciamentoClinica;