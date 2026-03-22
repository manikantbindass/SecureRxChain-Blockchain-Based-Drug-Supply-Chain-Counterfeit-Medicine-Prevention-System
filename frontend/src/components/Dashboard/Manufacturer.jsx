import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import api from '../../utils/api';

const Manufacturer = () => {
  const [formData, setFormData] = useState({
    batchId: '', drugName: '', manufacturingDate: '', expiryDate: '', quantity: '', description: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [transferData, setTransferData] = useState({ batchId: '', toAddress: '' });
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [errorTransfer, setErrorTransfer] = useState('');
  const [successTransfer, setSuccessTransfer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity)
      };
      const res = await api.post('/drugs/register', payload);
      setSuccess(`Drug Registered! Transaction Hash: ${res.data.txHash}`);
      setQrCode(res.data.qrImage);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to register drug');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoadingTransfer(true);
    setErrorTransfer('');
    setSuccessTransfer('');
    try {
      const payload = { ...transferData, newState: 1 }; // 1 = InTransit
      const res = await api.post('/drugs/transfer', payload);
      setSuccessTransfer(`Transfer Successful! Transaction Hash: ${res.data.txHash}`);
    } catch (err) {
      setErrorTransfer(err.response?.data?.msg || 'Failed to transfer drug');
    } finally {
      setLoadingTransfer(false);
    }
  };

  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="center">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '600px' }}>
        <Typography variant="h5" mb={3}>Manufacturer Portal: Register New Drug Batch</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Batch ID (e.g., BATCH001)" margin="normal" value={formData.batchId} onChange={(e) => setFormData({...formData, batchId: e.target.value})} required />
          <TextField fullWidth label="Drug Name" margin="normal" value={formData.drugName} onChange={(e) => setFormData({...formData, drugName: e.target.value})} required />
          <TextField fullWidth label="Description" margin="normal" multiline rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <TextField fullWidth label="Manufacturing Date" type="date" InputLabelProps={{ shrink: true }} margin="normal" value={formData.manufacturingDate} onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})} required />
          <TextField fullWidth label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} margin="normal" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} required />
          <TextField fullWidth label="Quantity" type="number" margin="normal" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
          
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Register Drug on Blockchain'}
          </Button>
        </form>

        {qrCode && (
          <Box mt={4} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6">Generated QR Code</Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>Print this on the drug packaging</Typography>
            <img src={qrCode} alt="Drug QR Code" style={{ border: '1px solid #ddd', padding: '10px' }} />
            <Button variant="outlined" sx={{ mt: 2 }} href={qrCode} download={`QR_${formData.batchId}.png`}>
              Download QR Code
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4, width: '100%' }} />
        <Typography variant="h5" mb={3} mt={2}>Transfer Drug Batch to Distributor</Typography>
        
        {errorTransfer && <Alert severity="error" sx={{ mb: 2 }}>{errorTransfer}</Alert>}
        {successTransfer && <Alert severity="success" sx={{ mb: 2 }}>{successTransfer}</Alert>}

        <form onSubmit={handleTransfer} style={{ width: '100%' }}>
          <TextField fullWidth label="Batch ID" margin="normal" value={transferData.batchId} onChange={(e) => setTransferData({...transferData, batchId: e.target.value})} required />
          <TextField fullWidth label="Distributor Wallet Address" margin="normal" value={transferData.toAddress} onChange={(e) => setTransferData({...transferData, toAddress: e.target.value})} required />
          
          <Button fullWidth variant="contained" color="secondary" type="submit" sx={{ mt: 3 }} disabled={loadingTransfer}>
            {loadingTransfer ? <CircularProgress size={24} /> : 'Transfer Ownership'}
          </Button>
        </form>

      </Paper>
    </Box>
  );
};

export default Manufacturer;
