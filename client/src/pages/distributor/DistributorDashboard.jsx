// client/src/pages/distributor/DistributorDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { LocalShipping, SwapHoriz, Inventory, CheckCircle } from '@mui/icons-material';
import drugService from '../../services/drugService';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  manufactured: 'info', in_transit: 'warning', at_distributor: 'secondary',
  at_pharmacy: 'primary', sold: 'success', quarantined: 'error',
};

const DistributorDashboard = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, batchId: '' });
  const [toAddress, setToAddress] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try { const data = await drugService.getMyBatches(); setBatches(data); }
    catch { setError('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const handleTransfer = async () => {
    setTransferring(true);
    try {
      await drugService.transferDrug({ batchId: dialog.batchId, toAddress, newState: 'at_pharmacy' });
      setDialog({ open: false, batchId: '' }); setToAddress('');
      fetchBatches();
    } catch { setError('Transfer failed'); }
    finally { setTransferring(false); }
  };

  const stats = [
    { label: 'Total Inventory', value: batches.length, color: '#388e3c', icon: <Inventory /> },
    { label: 'In Transit', value: batches.filter(b => b.currentState === 'in_transit').length, color: '#f57c00', icon: <LocalShipping /> },
    { label: 'At Distributor', value: batches.filter(b => b.currentState === 'at_distributor').length, color: '#1976d2', icon: <CheckCircle /> },
    { label: 'Sent to Pharmacy', value: batches.filter(b => b.currentState === 'at_pharmacy').length, color: '#7b1fa2', icon: <SwapHoriz /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Distributor Portal</Typography>
        <Typography color="text.secondary">Welcome, {user?.name}</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
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
      <Typography variant="h6" fontWeight={600} mb={2}>Inventory</Typography>
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
                    <Button size="small" variant="outlined" onClick={() => setDialog({ open: true, batchId: b.batchId })}>
                      Transfer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!batches.length && <TableRow><TableCell colSpan={6} align="center">No inventory</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, batchId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer to Pharmacy - {dialog.batchId}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Pharmacy Wallet Address" value={toAddress}
            onChange={e => setToAddress(e.target.value)} placeholder="0x..." sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, batchId: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleTransfer} disabled={transferring || !toAddress}>
            {transferring ? <CircularProgress size={20} /> : 'Confirm Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DistributorDashboard;
