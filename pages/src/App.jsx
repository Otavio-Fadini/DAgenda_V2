import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';

// Componentes de Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Páginas Públicas
import Login from './pages/Login';
import CadastroPaciente from './pages/Cadastro/CadastroPaciente';
import CadastroProfissional from './pages/Cadastro/CadastroProfissional';
import CadastroClinica from './pages/Cadastro/CadastroClinica';

// Dashboards por Perfil
import DashboardPaciente from './pages/Paciente/DashboardPaciente';
import DashboardMedico from './pages/Profissional/DashboardMedico';
import DashboardClinica from './pages/Clinica/DashboardClinica';

// Páginas Funcionais do Paciente (Novas)
import NovoAgendamento from './pages/Paciente/NovoAgendamento';
import MeusAgendamentos from './pages/Paciente/MeusAgendamentos';
import ProntuarioPaciente from './pages/Paciente/ProntuarioPaciente';
import FinanceiroPaciente from './pages/Paciente/FinanceiroPaciente';

// Outros
import Profissionais from './pages/Profissionais';

const medicalTheme = createTheme({
  palette: {
    primary: { main: '#32B5FE' }, 
    secondary: { main: '#10b981' },
    background: { default: '#f8fafc' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", sans-serif' },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setUserType(data.tipoUsuario);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', data.tipoUsuario);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserType(null);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* ROTAS PÚBLICAS */}
          <Route path="/" element={!token ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} />
          
          <Route path="/cadastro/paciente" element={<CadastroPaciente />} />
          <Route path="/cadastro/profissional" element={<CadastroProfissional />} />
          <Route path="/cadastro/clinica" element={<CadastroClinica />} />

          {/* ROTA PROTEGIDA COM SUB-ROTAS */}
          <Route path="/dashboard/*" element={token ? <SystemLayout userType={userType} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function SystemLayout({ userType, onLogout }) {
  const userName = localStorage.getItem('userName') || "Usuário";

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', m: 0, p: 0, bgcolor: '#f8fafc' }}>
      
      {/* SIDEBAR DINÂMICA (Já filtra os itens pelo userType) */}
      <Sidebar onLogout={onLogout} userType={userType} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <Header userName={userName} />
        
        <Box component="main" sx={{ 
          p: 0, flexGrow: 1, width: '100%', maxWidth: '100%', 
          overflowY: 'auto', overflowX: 'hidden', display: 'flex', 
          flexDirection: 'column', bgcolor: '#f8fafc' 
        }}>
          <Routes>
            {/* ROTA INICIAL DO DASHBOARD */}
            <Route index element={
               userType === 'usuarios_cpf' ? <DashboardPaciente /> :
               userType === 'profissionais' ? <DashboardMedico /> :
               userType === 'usuarios_cnpj' ? <DashboardClinica /> : 
               <Profissionais /> 
            } />

            {/* ROTAS ESPECÍFICAS DO PACIENTE */}
            {userType === 'usuarios_cpf' && (
              <>
                <Route path="novo-agendamento" element={<NovoAgendamento />} />
                <Route path="meus-agendamentos" element={<MeusAgendamentos />} />
                <Route path="prontuario" element={<ProntuarioPaciente />} />
                <Route path="financeiro" element={<FinanceiroPaciente />} />
              </>
            )}

            {/* REDIRECIONAMENTO DE SEGURANÇA DENTRO DO DASHBOARD */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;