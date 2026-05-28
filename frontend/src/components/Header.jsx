import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Avatar, IconButton, Badge, Popover, List, ListItem, 
  ListItemAvatar, ListItemText, Button, CircularProgress, Divider 
} from '@mui/material';
import { Bell, Check, X, Building2 } from 'lucide-react';
import api from '../services/api'; // Ajuste o caminho se necessário

const Header = ({ userName, userFoto }) => {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Verifica se o utilizador logado é um profissional através da chave 'userType'
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userFoto = localStorage.getItem('userFoto'); 
  const userType = localStorage.getItem('userType');
  const isProfissional = userType === 'profissionais';

  useEffect(() => {
    if (isProfissional) {
      carregarConvites();
    }
  }, [isProfissional]);

  const carregarConvites = async () => {
    try {
      const response = await api.get('/profissional/meus-convites');
      setConvites(response.data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    }
  };

  const handleOpenNotificacoes = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotificacoes = () => {
    setAnchorEl(null);
  };

  const handleResponder = async (conviteId, resposta) => {
    setLoading(true);
    try {
      await api.put('/profissional/responder-convite', { 
        convite_id: conviteId, 
        resposta: resposta 
      });
      // Remove o convite da lista após responder
      setConvites(prev => prev.filter(c => c.convite_id !== conviteId));
    } catch (error) {
      console.error(`Erro ao ${resposta} convite:`, error);
      alert("Erro ao processar a sua resposta.");
    } finally {
      setLoading(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box
      component="header"
      sx={{
        height: '70px', bgcolor: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', px: 3, borderBottom: '1px solid #e2e8f0',
        width: '100%', boxSizing: 'border-box', flexShrink: 0,
      }}
    >
      <Typography variant="h6" fontWeight="900" color="#0F172A" sx={{ letterSpacing: '-0.5px' }}>
        DAGENDA
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        
        {/* SININHO DE NOTIFICAÇÕES (Apenas para Profissionais) */}
        {isProfissional && (
          <>
            <IconButton onClick={handleOpenNotificacoes} sx={{ bgcolor: '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}>
              <Badge badgeContent={convites.length} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                <Bell size={20} color="#64748B" />
              </Badge>
            </IconButton>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseNotificacoes}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 350, borderRadius: '16px', mt: 1.5, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' } }}
            >
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A">Notificações</Typography>
              </Box>
              
              <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                {convites.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="#94A3B8" fontWeight={500}>Nenhum convite pendente.</Typography>
                  </Box>
                ) : (
                  convites.map((convite) => (
                    <Box key={convite.convite_id}>
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, width: '100%' }}>
                          <Avatar src={convite.foto_perfil} sx={{ width: 40, height: 40, bgcolor: '#F1F5F9' }}>
                            <Building2 size={20} color="#32B5FE" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                              {convite.nome_fantasia}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              Convidou-o(a) para se juntar à equipe clínica ({convite.cidade})
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          <Button 
                            fullWidth variant="outlined" size="small"
                            disabled={loading} onClick={() => handleResponder(convite.convite_id, 'recusado')}
                            startIcon={<X size={14} />}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: '#EF4444', borderColor: '#FECACA', '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' } }}
                          >
                            Recusar
                          </Button>
                          <Button 
                            fullWidth variant="contained" size="small"
                            disabled={loading} onClick={() => handleResponder(convite.convite_id, 'aceito')}
                            startIcon={loading ? <CircularProgress size={14} color="inherit"/> : <Check size={14} />}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#10B981', boxShadow: 'none', '&:hover': { bgcolor: '#059669', boxShadow: 'none' } }}
                          >
                            Aceitar
                          </Button>
                        </Box>
                      </ListItem>
                      <Divider />
                    </Box>
                  ))
                )}
              </List>
            </Popover>
          </>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" fontWeight="800" color="#0F172A">{userName}</Typography>
          <Avatar src={userFoto} sx={{ width: 42, height: 42, border: '2px solid #F1F5F9' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;