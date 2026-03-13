// client/src/pages/pharmacy/PharmacyDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { LocalPharmacy, ShoppingCart, Inventory, VerifiedUser } from '@mui/icons-material';
import drugService from '../../services/drugService';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  manufactured: 'info', in_transit: 'warning', at_distributor: 'secondary',
  at_pharmacy: 'primary', sold: 'success', quarantined: 'error',
};

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sellDialog, setSellDialog] = useState({ open: false, batchId: '' });
  const [buyerAddress, setBuyerAddress] = useState('');
  const [selling, setSelling] = useState(false);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try { const data = await drugService.getMyBatches(); setBatches(data); }
    catch { setError('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const handleSell = async () => {
    setSelling(true);
    try {
      await drugService.transferDrug({ batchId: sellDialog.batchId, toAddress: buyerAddress, newState: 'sold' });
      setSellDialog({ open: false, batchId: '' }); setBuyerAddress('');
      setSuccess('Drug sold successfully!');
      fetchBatches();
    } catch { setError('Sale failed'); }
    finally { setSelling(false); }
  };

  const stats = [
    { label: 'Total Stock', value: batches.length, color: '#f57c00', icon: <Inventory /> },
    { label: 'At Pharmacy', value: batches.filter(b => b.currentState === 'at_pharmacy').length, color: '#1976d2', icon: <LocalPharmacy /> },
    { label: 'Sold', value: batches.filter(b => b.currentState === 'sold').length, color: '#388e3c', icon: <ShoppingCart /> },
    { label: 'Quarantined', value: batches.filter(b => b.currentState === 'quarantined').length, color: '#c62828', icon: <VerifiedUser /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Pharmacy Portal</Typography>
        <Typography color="text.secondary">Welcome, {user?.name}</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <Grid container spacing={2} mb={3}>
        {stats.map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card sx={{ border: `1px solid ${s.color}33` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Box>
                  <Box sx={{ color: s.color, opacity: 0.6 }}>{s.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" fontWeight={600} mb={2}>Stock Inventory</Typography>
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch ID</TableCell><TableCell>Drug Name</TableCell>
                <TableCell>Qty</TableCell><TableCell>Expiry</TableCell>
                <TableCell>Status</TableCell><TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map(b => (
                <TableRow key={b._id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{b.batchId}</TableCell>
                  <TableCell>{b.drugName}</TableCell>
                  <TableCell>{b.quantity}</TableCell>
                  <TableCell>{new Date(b.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={b.currentState} color={statusColors[b.currentState] || 'default'} size="small" /></TableCell>
                  <TableCell>
                    {b.currentState === 'at_pharmacy' && (
                      <Button size="small" variant="contained" color="success"
                        onClick={() => setSellDialog({ open: true, batchId: b.batchId })}>
                        Sell Drug
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!batches.length && <TableRow><TableCell colSpan={6} align="center">No stock</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={sellDialog.open} onClose={() => setSellDialog({ open: false, batchId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Sell Drug - {sellDialog.batchId}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Buyer Wallet Address (optional)" value={buyerAddress}
            onChange={e => setBuyerAddress(e.target.value)} placeholder="0x..." sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialog({ open: false, batchId: '' })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSell} disabled={selling}>
            {selling ? <CircularProgress size={20} /> : 'Confirm Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyDashboard;
