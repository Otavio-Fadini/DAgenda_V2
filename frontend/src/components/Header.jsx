import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const Header = ({ userName, userFoto }) => {
  return (
    <Box
      component="header"
      sx={{
        height: '70px',
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        borderBottom: '1px solid #e2e8f0',
        width: '100%', // 100% do espaço disponível, não da tela toda!
        boxSizing: 'border-box', 
        flexShrink: 0, // Impede que o header achate
      }}
    >
      <Typography variant="h6" fontWeight="bold">DAgenda</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" fontWeight="bold">{userName}</Typography>
        <Avatar src={userFoto} sx={{ width: 40, height: 40 }} />
      </Box>
    </Box>
  );
};

export default Header;