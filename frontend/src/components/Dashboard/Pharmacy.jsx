import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import api from '../../utils/api';

const Pharmacy = () => {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSell = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/drugs/sell', { batchId });
      setSuccess(`Drug Sold! Transaction Hash: ${res.data.txHash}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to sell drug');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '500px' }}>
        <Typography variant="h5" mb={3}>Pharmacy Portal: Sell Drug</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSell}>
          <TextField fullWidth label="Batch ID" margin="normal" value={batchId} onChange={(e) => setBatchId(e.target.value)} required />
          
          <Button fullWidth variant="contained" color="secondary" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Mark as Sold to Consumer'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Pharmacy;
