import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';

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

// Páginas Funcionais do Paciente
import NovoAgendamento from './pages/Paciente/NovoAgendamento';
import MeusAgendamentos from './pages/Paciente/MeusAgendamentos';
import ProntuarioPaciente from './pages/Paciente/ProntuarioPaciente';
import FinanceiroPaciente from './pages/Paciente/FinanceiroPaciente';
import ConfiguracoesPaciente from './pages/Paciente/ConfiguracoesPaciente';

// Páginas Funcionais do Profissional
import AgendaMedica from './pages/Profissional/AgendaMedica';
import ConfiguracoesPerfil from './pages/Profissional/ConfiguracoesPerfil';
import FinanceiroProfissional from './pages/Profissional/FinanceiroProfissional';
import AtendimentoMedico from './pages/Profissional/AtendimentoMedico';

// Páginas Funcionais da Clinica
import GerenciamentoClinica from './pages/Clinica/GerenciamentoClinica';
import MedicosUnidade from './pages/Clinica/MedicosUnidade';
import FinanceiroClinica from './pages/Clinica/FinanceiroClinica';

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
    <Router>
        <Routes>
          <Route path="/" element={!token ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/cadastro/paciente" element={<CadastroPaciente />} />
          <Route path="/cadastro/profissional" element={<CadastroProfissional />} />
          <Route path="/cadastro/clinica" element={<CadastroClinica />} />
          <Route path="/dashboard/*" element={token ? <SystemLayout userType={userType} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Router>
  );
}

function SystemLayout({ userType, onLogout }) {
  const theme = useTheme();
  const userName = localStorage.getItem('userName') || 'Usuário';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <Box className="app-shell">
      <Sidebar
        onLogout={onLogout}
        userType={userType}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
        isMobile={isMobile}
      />

      <Box className="app-content">
        <Header userName={userName} onMenuClick={() => setMobileMenuOpen(true)} showMenuButton={isMobile} />

        <Box component="main" className="app-main">
          <Routes>
            <Route index element={
              userType === 'usuarios_cpf' ? <DashboardPaciente /> :
              userType === 'profissionais' ? <DashboardMedico /> :
              userType === 'usuarios_cnpj' ? <DashboardClinica /> :
              <Navigate to="/" replace />
            } />

            {userType === 'usuarios_cpf' && (
              <>
                <Route path="novo-agendamento" element={<NovoAgendamento />} />
                <Route path="meus-agendamentos" element={<MeusAgendamentos />} />
                <Route path="prontuario" element={<ProntuarioPaciente />} />
                <Route path="financeiro" element={<FinanceiroPaciente />} />
                <Route path="configuracao" element={<ConfiguracoesPaciente />} />
              </>
            )}

            {userType === 'profissionais' && (
              <>
                <Route path="agenda-medica" element={<AgendaMedica />} />
                <Route path="configuracao" element={<ConfiguracoesPerfil />} />
                <Route path="financeiro" element={<FinanceiroProfissional />} />
                <Route path="atendimento" element={<AtendimentoMedico />} />
              </>
            )}

            {userType === 'usuarios_cnpj' && (
              <>
                <Route path="medicos-unidade" element={<MedicosUnidade />} />
                <Route path="gerenciamento" element={<GerenciamentoClinica />} />
                <Route path="financeiro" element={<FinanceiroClinica />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
