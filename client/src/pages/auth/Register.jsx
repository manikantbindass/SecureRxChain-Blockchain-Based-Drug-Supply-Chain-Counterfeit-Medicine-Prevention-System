// client/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider,
  Link, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Visibility, VisibilityOff, MedicalServices } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer', walletAddress: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result) navigate('/login');
  };

  return (
    <Box
      display="flex" alignItems="center" justifyContent="center"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)' }}
    >
      <Card sx={{ maxWidth: 460, width: '100%', mx: 2, bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <MedicalServices sx={{ fontSize: 48, color: '#58a6ff', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#e6edf3">Create Account</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Join SecureRxChain</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Full Name" name="name"
              value={form.name} onChange={handleChange} required
              sx={{ mb: 2 }} InputProps={{ sx: { bgcolor: '#0d1117' } }}
            />
            <TextField
              fullWidth label="Email Address" name="email" type="email"
              value={form.email} onChange={handleChange} required
              sx={{ mb: 2 }} InputProps={{ sx: { bgcolor: '#0d1117' } }}
            />
            <TextField
              fullWidth label="Password" name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required
              sx={{ mb: 2 }}
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} onChange={handleChange} label="Role"
                sx={{ bgcolor: '#0d1117' }}>
                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                <MenuItem value="distributor">Distributor</MenuItem>
                <MenuItem value="pharmacy">Pharmacy</MenuItem>
                <MenuItem value="consumer">Consumer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth label="Wallet Address (optional)" name="walletAddress"
              value={form.walletAddress} onChange={handleChange}
              sx={{ mb: 3 }} InputProps={{ sx: { bgcolor: '#0d1117' } }}
              placeholder="0x..."
            />

            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ py: 1.5, mb: 2, bgcolor: '#1f6feb', '&:hover': { bgcolor: '#388bfd' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: '#30363d' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" color="#58a6ff">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
