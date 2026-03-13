// client/src/pages/manufacturer/TransferDrug.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { ArrowBack, SwapHoriz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import drugService from '../../services/drugService';

const TransferDrug = () => {
  const navigate = useNavigate();
  const { batchId: paramBatchId } = useParams();
  const [form, setForm] = useState({
    batchId: paramBatchId || '',
    toAddress: '',
    newState: 'in_transit',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await drugService.transferDrug(form);
      setSuccess('Drug transferred successfully on blockchain!');
      setTimeout(() => navigate('/manufacturer'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/manufacturer')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Transfer Drug</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Batch ID" name="batchId" value={form.batchId}
              onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
            />
            <TextField
              fullWidth label="Recipient Wallet Address" name="toAddress"
              value={form.toAddress} onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
              placeholder="0x..."
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New State</InputLabel>
              <Select name="newState" value={form.newState} onChange={handleChange} label="New State"
                sx={{ bgcolor: '#0d1117' }}>
                <MenuItem value="in_transit">In Transit (to Distributor)</MenuItem>
                <MenuItem value="at_distributor">At Distributor</MenuItem>
                <MenuItem value="at_pharmacy">At Pharmacy</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth label="Notes (optional)" name="notes" value={form.notes}
              onChange={handleChange} multiline rows={2} sx={{ mb: 3 }}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/manufacturer')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} startIcon={<SwapHoriz />}
                sx={{ bgcolor: '#1f6feb', '&:hover': { bgcolor: '#388bfd' } }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Transfer on Blockchain'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransferDrug;
