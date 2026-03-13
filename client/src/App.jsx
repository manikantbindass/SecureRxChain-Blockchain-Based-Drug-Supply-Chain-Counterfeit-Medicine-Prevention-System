// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManufacturerDashboard from './pages/manufacturer/ManufacturerDashboard';
import RegisterDrug from './pages/manufacturer/RegisterDrug';
import TransferDrug from './pages/manufacturer/TransferDrug';
import GenerateQR from './pages/manufacturer/GenerateQR';
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#58a6ff' },
    secondary: { main: '#bc8cff' },
    background: { default: '#0d1117', paper: '#161b22' },
    text: { primary: '#e6edf3', secondary: '#8b949e' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid #21262d' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 6 },
      },
    },
  },
});

const AppLayout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Navbar />
    <Box component="main">{children}</Box>
  </Box>
);

// Role-based redirect after login
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleMap = {
    manufacturer: '/manufacturer',
    distributor: '/distributor',
    pharmacy: '/pharmacy',
    consumer: '/consumer',
    admin: '/admin',
  };
  return <Navigate to={roleMap[user.role] || '/login'} replace />;
};

// Unauthorized page
const UnauthorizedPage = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
    <Typography variant="h4" color="error">Access Denied</Typography>
    <Typography color="text.secondary">You do not have permission to view this page.</Typography>
    <Button variant="contained" href="/login">Go to Login</Button>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Web3Provider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<AppLayout><ConsumerDashboard /></AppLayout>} />
              <Route path="/verify/:batchId" element={<AppLayout><ConsumerDashboard /></AppLayout>} />
              <Route path="/unauthorized" element={<AppLayout><UnauthorizedPage /></AppLayout>} />

              {/* Role-based home redirect */}
              <Route path="/" element={<RoleRedirect />} />

              {/* Manufacturer */}
              <Route path="/manufacturer" element={
                <PrivateRoute roles={['manufacturer']}>
                  <AppLayout><ManufacturerDashboard /></AppLayout>
                </PrivateRoute>
              } />
              <Route path="/manufacturer/register-drug" element={
                <PrivateRoute roles={['manufacturer']}>
                  <AppLayout><RegisterDrug /></AppLayout>
                </PrivateRoute>
              } />
              <Route path="/manufacturer/transfer" element={
                <PrivateRoute roles={['manufacturer']}>
                  <AppLayout><TransferDrug /></AppLayout>
                </PrivateRoute>
              } />
              <Route path="/manufacturer/transfer/:batchId" element={
                <PrivateRoute roles={['manufacturer']}>
                  <AppLayout><TransferDrug /></AppLayout>
                </PrivateRoute>
              } />
              <Route path="/manufacturer/generate-qr" element={
                <PrivateRoute roles={['manufacturer']}>
                  <AppLayout><GenerateQR /></AppLayout>
                </PrivateRoute>
              } />

              {/* Distributor */}
              <Route path="/distributor" element={
                <PrivateRoute roles={['distributor']}>
                  <AppLayout><DistributorDashboard /></AppLayout>
                </PrivateRoute>
              } />

              {/* Pharmacy */}
              <Route path="/pharmacy" element={
                <PrivateRoute roles={['pharmacy']}>
                  <AppLayout><PharmacyDashboard /></AppLayout>
                </PrivateRoute>
              } />

              {/* Consumer */}
              <Route path="/consumer" element={
                <PrivateRoute roles={['consumer']}>
                  <AppLayout><ConsumerDashboard /></AppLayout>
                </PrivateRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <PrivateRoute roles={['admin']}>
                  <AppLayout><AdminDashboard /></AppLayout>
                </PrivateRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
