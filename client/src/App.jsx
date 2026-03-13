import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BatchesPage from './pages/BatchesPage';
import VerifyPage from './pages/VerifyPage';
import AnomaliesPage from './pages/AnomaliesPage';
import ProfilePage from './pages/ProfilePage';

import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    secondary: { main: '#00ACC1' },
    background: { default: '#F0F4F8' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Web3Provider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/batches" element={<PrivateRoute><BatchesPage /></PrivateRoute>} />
            <Route path="/anomalies" element={<PrivateRoute><AnomaliesPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
