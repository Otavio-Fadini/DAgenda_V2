import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Tooltip } from '@mui/material';
import { 
    LayoutDashboard, CalendarDays, Users, Wallet, LogOut, 
    ChevronLeft, ChevronRight, Stethoscope, Building2, ClipboardList,
    CalendarCheck, Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = ({ onLogout, userType }) => {
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
            { text: 'Medicos na Unidade', icon: <Stethoscope size={22} />, path: '/dashboard/medicos-unidade' },
            { text: 'Gerenciamento', icon: <Building2 size={22} />, path: '/dashboard/gerenciamento' },
            { text: 'Financeiro Geral', icon: <Wallet size={22} />, path: '/dashboard/financeiro' },
        ]
    };

    const menuItems = menuConfig[userType] || menuConfig['usuarios_cpf'];

    const handleLogout = () => {
        if (onLogout) onLogout();
        localStorage.clear();
        navigate('/');
    };

    return (
        <Box sx={{ 
            // TRAVAMENTO DE TAMANHO
            width: collapsed ? 80 : 270, 
            minWidth: collapsed ? 80 : 270, 
            maxWidth: collapsed ? 80 : 270,
            flexShrink: 0, // IMPEDE QUE O CONTEÚDO AO LADO APERTE A SIDEBAR
            
            height: '100vh', 
            bgcolor: '#0f172a', 
            color: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRight: '1px solid rgba(255,255,255,0.1)', 
            zIndex: 1200,
            position: 'relative'
        }}>
            {/* CABEÇALHO COM LOGO DINÂMICA */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minHeight: 80 }}>
                {!collapsed ? (
                    <img src={logo} alt="DAGENDA" style={{ height: '40px', objectFit: 'contain' }} />
                ) : (
                    <img src={logo} alt="D" style={{ height: '30px', width: '30px', objectFit: 'cover', objectPosition: 'left' }} />
                )}
                <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: '#94a3b8', ml: collapsed ? 0 : 1, '&:hover': { color: '#32B5FE' } }}>
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </IconButton>
            </Box>

            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mx: 2 }} />

            {/* LISTA DE NAVEGAÇÃO DINÂMICA */}
            <List sx={{ mt: 2, flexGrow: 1, px: 1.5, overflowX: 'hidden' }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Tooltip key={item.text} title={collapsed ? item.text : ""} placement="right">
                            <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        minHeight: 48, 
                                        justifyContent: collapsed ? 'center' : 'initial', 
                                        px: 2.5, 
                                        borderRadius: 2,
                                        bgcolor: active ? 'rgba(50, 181, 254, 0.12)' : 'transparent',
                                        color: active ? '#32B5FE' : '#94a3b8',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: active ? '#32B5FE' : 'white' }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 3, justifyContent: 'center', color: 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText 
                                            primary={item.text} 
                                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 800 : 500, noWrap: true }} 
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    );
                })}
            </List>

            {/* RODAPÉ */}
            <Box sx={{ p: 1.5 }}>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1.5 }} />
                <ListItemButton 
                    onClick={handleLogout} 
                    sx={{ 
                        minHeight: 48, 
                        justifyContent: collapsed ? 'center' : 'initial', 
                        px: 2.5, 
                        borderRadius: 2, 
                        color: '#f87171', 
                        '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } 
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 3, justifyContent: 'center', color: 'inherit' }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary="Sair da Conta" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, noWrap: true }} />}
                </ListItemButton>
            </Box>
        </Box>
    );
};

export default Sidebar;