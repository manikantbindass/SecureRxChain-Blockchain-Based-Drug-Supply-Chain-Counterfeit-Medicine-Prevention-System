// client/src/pages/consumer/ConsumerDashboard.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, CircularProgress, Chip, Stepper, Step, StepLabel,
  StepContent, Paper, Divider, Grid
} from '@mui/material';
import {
  QrCode2, Search, VerifiedUser, Warning, CheckCircle,
  LocalPharmacy, LocalShipping, Factory
} from '@mui/icons-material';
import drugService from '../../services/drugService';

const stateSteps = [
  { label: 'Manufactured', state: 'manufactured', icon: <Factory /> },
  { label: 'In Transit', state: 'in_transit', icon: <LocalShipping /> },
  { label: 'At Distributor', state: 'at_distributor', icon: <LocalShipping /> },
  { label: 'At Pharmacy', state: 'at_pharmacy', icon: <LocalPharmacy /> },
  { label: 'Sold', state: 'sold', icon: <CheckCircle /> },
];

const ConsumerDashboard = () => {
  const [batchId, setBatchId] = useState('');
  const [drugData, setDrugData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!batchId.trim()) { setError('Please enter a Batch ID'); return; }
    setLoading(true); setError(''); setDrugData(null);
    try {
      const [drug, hist] = await Promise.all([
        drugService.verifyDrug(batchId),
        drugService.getDrugHistory(batchId),
      ]);
      setDrugData(drug);
      setHistory(hist || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Drug not found or verification failed');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = drugData
    ? stateSteps.findIndex(s => s.state === drugData.currentState)
    : -1;

  const isQuarantined = drugData?.currentState === 'quarantined';

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box textAlign="center" mb={4}>
        <QrCode2 sx={{ fontSize: 56, color: '#58a6ff', mb: 1 }} />
        <Typography variant="h4" fontWeight={700}>Drug Verification</Typography>
        <Typography color="text.secondary" mt={1}>
          Verify the authenticity of any medicine using its Batch ID
        </Typography>
      </Box>

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Enter Batch ID"
              value={batchId}
              onChange={e => setBatchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
              placeholder="e.g. BATCH-2024-001"
            />
            <Button
              variant="contained" onClick={handleVerify} disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
              sx={{ minWidth: 130, bgcolor: '#1f6feb', '&:hover': { bgcolor: '#388bfd' } }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {drugData && (
        <>
          <Alert
            severity={isQuarantined ? 'error' : 'success'}
            icon={isQuarantined ? <Warning /> : <VerifiedUser />}
            sx={{ mb: 3, fontSize: 16 }}
          >
            {isQuarantined
              ? 'WARNING: This drug has been QUARANTINED. Do not consume!'
              : 'Drug verified successfully. This is an authentic medicine.'}
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Drug Details</Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {[
                      ['Drug Name', drugData.drugName],
                      ['Batch ID', drugData.batchId],
                      ['Manufacturer', drugData.manufacturer?.name || 'N/A'],
                      ['Quantity', drugData.quantity],
                      ['Manufacturing Date', new Date(drugData.manufacturingDate).toLocaleDateString()],
                      ['Expiry Date', new Date(drugData.expiryDate).toLocaleDateString()],
                      ['Composition', drugData.composition || 'N/A'],
                      ['Storage', drugData.storageConditions || 'N/A'],
                    ].map(([k, v]) => (
                      <Box key={k} display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{k}:</Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: '60%', textAlign: 'right' }}>{v}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ borderColor: '#30363d' }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={drugData.currentState?.replace(/_/g, ' ').toUpperCase()}
                        color={isQuarantined ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Supply Chain Timeline</Typography>
                  <Stepper orientation="vertical" activeStep={currentStep}>
                    {stateSteps.map((step, i) => (
                      <Step key={step.state} completed={i <= currentStep && !isQuarantined}>
                        <StepLabel>{step.label}</StepLabel>
                        <StepContent>
                          <Typography variant="caption" color="text.secondary">
                            {history.find(h => h.state === step.state)?.timestamp
                              ? new Date(history.find(h => h.state === step.state).timestamp).toLocaleString()
                              : 'Pending'}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                  {isQuarantined && (
                    <Alert severity="error" sx={{ mt: 2 }}>Quarantined</Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {history.length > 0 && (
            <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Transaction History</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {history.map((h, i) => (
                    <Paper key={i} sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #21262d' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{h.state?.replace(/_/g, ' ')}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            From: {h.from?.slice(0, 10)}... To: {h.to?.slice(0, 10)}...
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {h.timestamp ? new Date(h.timestamp).toLocaleDateString() : ''}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default ConsumerDashboard;
