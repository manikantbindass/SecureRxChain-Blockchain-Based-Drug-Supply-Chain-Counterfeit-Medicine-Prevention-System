// client/src/pages/manufacturer/RegisterDrug.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Grid, Divider
} from '@mui/material';
import { ArrowBack, AddCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import drugService from '../../services/drugService';

const RegisterDrug = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    drugName: '', batchId: '', quantity: '', manufacturingDate: '',
    expiryDate: '', composition: '', storageConditions: '', price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const result = await drugService.registerDrug(form);
      setSuccess(`Drug registered! Batch ID: ${result.batchId}`);
      setForm({ drugName: '', batchId: '', quantity: '', manufacturingDate: '', expiryDate: '', composition: '', storageConditions: '', price: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/manufacturer')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Register New Drug</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Drug Name" name="drugName" value={form.drugName}
                  onChange={handleChange} required InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Batch ID" name="batchId" value={form.batchId}
                  onChange={handleChange} required InputProps={{ sx: { bgcolor: '#0d1117' } }}
                  helperText="Unique identifier for this batch" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Quantity" name="quantity" type="number" value={form.quantity}
                  onChange={handleChange} required InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Price (USD)" name="price" type="number" value={form.price}
                  onChange={handleChange} InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Manufacturing Date" name="manufacturingDate" type="date"
                  value={form.manufacturingDate} onChange={handleChange} required
                  InputLabelProps={{ shrink: true }} InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Expiry Date" name="expiryDate" type="date"
                  value={form.expiryDate} onChange={handleChange} required
                  InputLabelProps={{ shrink: true }} InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Composition" name="composition" value={form.composition}
                  onChange={handleChange} multiline rows={2} InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Storage Conditions" name="storageConditions"
                  value={form.storageConditions} onChange={handleChange}
                  InputProps={{ sx: { bgcolor: '#0d1117' } }} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: '#30363d' }} />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/manufacturer')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} startIcon={<AddCircle />}
                sx={{ bgcolor: '#1f6feb', '&:hover': { bgcolor: '#388bfd' } }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Register Drug on Blockchain'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterDrug;
