/*import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, Button, Chip, Rating } from '@mui/material';
import { Calendar, MapPin, Award } from 'lucide-react';

const Profissionais = () => {
  // Dados de exemplo (Mock) para você visualizar agora
  const profissionaisExemplo = [
    {
      id: 1,
      nome: "Dra. Ana Beatriz",
      especialidade: "Cardiologista",
      clinica: "Clínica Vida",
      nota: 4.8,
      foto: "",
      preco: "250,00"
    },
    {
      id: 2,
      nome: "Dr. Marcos Silva",
      especialidade: "Dermatologista",
      clinica: "Health Center",
      nota: 4.9,
      foto: "",
      preco: "300,00"
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Profissionais Disponíveis
          </Typography>
          <Typography color="text.secondary">
            Encontre o especialista ideal para o seu atendimento.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<Calendar size={18} />}>
          Ver Agenda Geral
        </Button>
      </Box>

      <Grid container spacing={3}>
        {profissionaisExemplo.map((prof) => (
          <Grid item xs={12} sm={6} md={4} key={prof.id}>
            <Card sx={{ 
              transition: 'transform 0.2s', 
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } 
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar 
                    src={prof.foto} 
                    sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: 'primary.light' }}
                  >
                    {prof.nome.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{prof.nome}</Typography>
                    <Chip 
                      label={prof.especialidade} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'secondary.main', fontWeight: 600 }} 
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                  <MapPin size={16} />
                  <Typography variant="body2">{prof.clinica}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Rating value={prof.nota} readOnly size="small" precision={0.5} />
                  <Typography variant="caption" fontWeight="bold">({prof.nota})</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Consulta a partir de</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                      R$ {prof.preco}
                    </Typography>
                  </Box>
                  <Button variant="contained" size="small" sx={{ borderRadius: '8px' }}>
                    Agendar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Profissionais;*/