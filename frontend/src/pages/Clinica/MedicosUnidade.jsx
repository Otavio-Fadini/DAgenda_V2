import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Rating } from '@mui/material';
import { Stethoscope, Star, MessageSquare } from 'lucide-react';

const MedicosUnidade = () => {
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', width: '100%' }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', mb: 4, letterSpacing: '-1.5px' }}>Corpo Clínico</Typography>
            
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((_, i) => (
                    <Grid item xs={12} md={6} lg={4} key={i}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white', textAlign: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', border: '3px solid #32B5FE' }}>
                                <Stethoscope size={40} color="#32B5FE"/>
                            </Avatar>
                            <Typography variant="h6" fontWeight={900}>Dr. Cláudio Mendes</Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>CARDIOLOGIA • CRM 12345</Typography>
                            
                            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                <Rating value={5} readOnly size="small" />
                                <Typography variant="caption" fontWeight={700}>(48 avaliações)</Typography>
                            </Box>

                            <Button fullWidth variant="contained" sx={{ bgcolor: '#0f172a', fontWeight: 800, borderRadius: 3, textTransform: 'none', color: '#FFFFFF' }}>Gerenciar Escala</Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MedicosUnidade;