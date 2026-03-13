// client/src/pages/manufacturer/ManufacturerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import { Factory, AddCircle, QrCode, SwapHoriz, Inventory } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import drugService from '../../services/drugService';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  manufactured: 'info', in_transit: 'warning', at_distributor: 'secondary',
  at_pharmacy: 'primary', sold: 'success', quarantined: 'error',
};

const ManufacturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await drugService.getMyBatches();
      setBatches(data);
    } catch (err) {
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Batches', value: batches.length, icon: <Inventory />, color: '#1976d2' },
    { label: 'In Transit', value: batches.filter(b => b.currentState === 'in_transit').length, icon: <SwapHoriz />, color: '#f57c00' },
    { label: 'Manufactured', value: batches.filter(b => b.currentState === 'manufactured').length, icon: <Factory />, color: '#388e3c' },
    { label: 'Quarantined', value: batches.filter(b => b.currentState === 'quarantined').length, icon: <Factory />, color: '#c62828' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Manufacturer Portal</Typography>
          <Typography color="text.secondary">Welcome, {user?.name}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<AddCircle />} onClick={() => navigate('/manufacturer/register-drug')}>
            Register Drug
          </Button>
          <Button variant="outlined" startIcon={<QrCode />} onClick={() => navigate('/manufacturer/generate-qr')}>
            Generate QR
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card sx={{ border: `1px solid ${s.color}33` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Box>
                  <Box sx={{ color: s.color, opacity: 0.7 }}>{s.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Batches" />
        <Tab label="Transfer Drug" />
      </Tabs>

      {tab === 0 && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch ID</TableCell>
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{b.batchId}</TableCell>
                      <TableCell>{b.drugName}</TableCell>
                      <TableCell>{b.quantity}</TableCell>
                      <TableCell>{new Date(b.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={b.currentState} color={statusColors[b.currentState] || 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/manufacturer/transfer/${b.batchId}`)}>Transfer</Button>
                        <Button size="small" onClick={() => navigate(`/manufacturer/generate-qr?batchId=${b.batchId}`)}>QR</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!batches.length && (
                    <TableRow><TableCell colSpan={6} align="center">No batches registered yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tab === 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" onClick={() => navigate('/manufacturer/transfer')}>Go to Transfer Page</Button>
        </Box>
      )}
    </Box>
  );
};

export default ManufacturerDashboard;
