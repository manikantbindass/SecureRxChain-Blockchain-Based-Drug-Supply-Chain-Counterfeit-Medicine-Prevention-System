import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'consumer', organizationName: '', walletAddress: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/auth/register`, form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #00ACC1 100%)' }}>
      <Card sx={{ width: 480, borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom color="primary">Create Account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Password" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} margin="dense" required />
            <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={e => setForm({ ...form, role: e.target.value })}>
                <MenuItem value="consumer">Consumer</MenuItem>
                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                <MenuItem value="distributor">Distributor</MenuItem>
                <MenuItem value="retailer">Retailer</MenuItem>
                <MenuItem value="regulator">Regulator</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Organization Name" value={form.organizationName}
              onChange={e => setForm({ ...form, organizationName: e.target.value })} margin="dense" />
            <TextField fullWidth label="Wallet Address (optional)" value={form.walletAddress}
              onChange={e => setForm({ ...form, walletAddress: e.target.value })} margin="dense" />
            <Button fullWidth variant="contained" type="submit" size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>
          <Typography align="center" variant="body2" mt={2}>
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
