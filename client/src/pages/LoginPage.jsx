import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #00ACC1 100%)' }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">🔗 SecureRxChain</Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={3}>
            Drug Supply Chain Authentication
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} margin="normal" required />
            <Button fullWidth variant="contained" type="submit" size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>
          <Divider sx={{ my: 2 }} />
          <Typography align="center" variant="body2">
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
          <Typography align="center" variant="body2" mt={1}>
            Verify a medicine? <Link to="/verify">Quick Verify</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
