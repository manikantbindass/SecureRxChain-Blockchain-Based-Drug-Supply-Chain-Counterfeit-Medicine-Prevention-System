// client/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider, Link
} from '@mui/material';
import { Visibility, VisibilityOff, MedicalServices } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result?.role) {
      const redirectMap = {
        manufacturer: '/manufacturer',
        distributor: '/distributor',
        pharmacy: '/pharmacy',
        consumer: '/consumer',
        admin: '/admin',
      };
      navigate(redirectMap[result.role] || '/');
    }
  };

  return (
    <Box
      display="flex" alignItems="center" justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2, bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <MedicalServices sx={{ fontSize: 48, color: '#58a6ff', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#e6edf3">
              SecureRxChain
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Sign in to your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: { bgcolor: '#0d1117' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5, mb: 2, bgcolor: '#1f6feb', '&:hover': { bgcolor: '#388bfd' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: '#30363d' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" color="#58a6ff">
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
