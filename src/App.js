import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Invitations from './pages/Invitations';
import Tasks from './pages/Tasks';
import Layout from './components/Layout';

// Auth
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
