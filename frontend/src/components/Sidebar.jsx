import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Tooltip, Drawer
} from '@mui/material';
import {
  LayoutDashboard, CalendarDays, Wallet, LogOut,
  ChevronLeft, ChevronRight, Stethoscope, Building2, ClipboardList,
  CalendarCheck, Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.png';

const EXPANDED_WIDTH = 270;
const COLLAPSED_WIDTH = 82;

const Sidebar = ({ onLogout, userType, mobileOpen = false, onMobileClose, isMobile = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuConfig = {
    usuarios_cpf: [
      { text: 'Início', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
      { text: 'Agendar Consulta', icon: <CalendarDays size={22} />, path: '/dashboard/novo-agendamento' },
      { text: 'Meus Agendamentos', icon: <CalendarCheck size={22} />, path: '/dashboard/meus-agendamentos' },
      { text: 'Meu Prontuário', icon: <ClipboardList size={22} />, path: '/dashboard/prontuario' },
      { text: 'Financeiro', icon: <Wallet size={22} />, path: '/dashboard/financeiro' },
      { text: 'Configurações', icon: <Settings size={22} />, path: '/dashboard/configuracao' },
    ],
    profissionais: [
      { text: 'Painel Médico', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
      { text: 'Minha Agenda', icon: <CalendarDays size={22} />, path: '/dashboard/agenda-medica' },
      { text: 'Configurações', icon: <Settings size={22} />, path: '/dashboard/configuracao' },
      { text: 'Faturamento', icon: <Wallet size={22} />, path: '/dashboard/financeiro' },
    ],
    usuarios_cnpj: [
      { text: 'Gestão Clínica', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
      { text: 'Médicos na Unidade', icon: <Stethoscope size={22} />, path: '/dashboard/medicos-unidade' },
      { text: 'Gerenciamento', icon: <Building2 size={22} />, path: '/dashboard/gerenciamento' },
      { text: 'Financeiro Geral', icon: <Wallet size={22} />, path: '/dashboard/financeiro' },
    ],
  };

  const menuItems = menuConfig[userType] || menuConfig.usuarios_cpf;
  const sidebarWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.clear();
    navigate('/');
    if (isMobile && onMobileClose) onMobileClose();
  };

  const content = (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        height: '100dvh',
        bgcolor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease, max-width 0.25s ease',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: collapsed && !isMobile ? 'center' : 'space-between', minHeight: 76 }}>
        {(!collapsed || isMobile) ? (
          <img src={logo} alt="DAGENDA" style={{ height: 40, objectFit: 'contain' }} />
        ) : (
          <img src={logo} alt="D" style={{ height: 30, width: 30, objectFit: 'cover', objectPosition: 'left' }} />
        )}

        {!isMobile && (
          <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: '#94a3b8', '&:hover': { color: '#32B5FE' } }}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </IconButton>
        )}
      </Box>


      <List sx={{ mt: 2, flexGrow: 1, px: 1.5, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip key={item.text} title={collapsed && !isMobile ? item.text : ''} placement="right">
              <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                    px: 2.25,
                    borderRadius: 2,
                    bgcolor: active ? 'rgba(50, 181, 254, 0.14)' : 'transparent',
                    color: active ? '#32B5FE' : '#94a3b8',
                    '&:hover': {
                      bgcolor: active ? 'rgba(50, 181, 254, 0.18)' : 'rgba(255,255,255,0.06)',
                      color: active ? '#32B5FE' : '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: collapsed && !isMobile ? 0 : 2.5, justifyContent: 'center', color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 800 : 600, noWrap: true }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ p: 1.5, pt: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            justifyContent: collapsed && !isMobile ? 'center' : 'initial',
            px: 2.25,
            borderRadius: 2,
            color: '#f87171',
            '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.12)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed && !isMobile ? 0 : 2.5, justifyContent: 'center', color: 'inherit' }}>
            <LogOut size={20} />
          </ListItemIcon>
          {(!collapsed || isMobile) && <ListItemText primary="Sair da Conta" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700, noWrap: true }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { border: 0, bgcolor: 'transparent' } }}
      >
        {content}
      </Drawer>
    );
  }

  return content;
};

export default Sidebar;
