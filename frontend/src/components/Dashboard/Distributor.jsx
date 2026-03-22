import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import api from '../../utils/api';

const Distributor = () => {
  const [formData, setFormData] = useState({ batchId: '', toAddress: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData, newState: 2 }; // 2 = Distributed
      const res = await api.post('/drugs/transfer', payload);
      setSuccess(`Transfer Successful! Transaction Hash: ${res.data.txHash}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to transfer drug');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '500px' }}>
        <Typography variant="h5" mb={3}>Distributor Portal: Transfer Drug</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleTransfer}>
          <TextField fullWidth label="Batch ID" margin="normal" value={formData.batchId} onChange={(e) => setFormData({...formData, batchId: e.target.value})} required />
          <TextField fullWidth label="Pharmacy Wallet Address" margin="normal" value={formData.toAddress} onChange={(e) => setFormData({...formData, toAddress: e.target.value})} required />
          
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Transfer Ownership'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Distributor;
