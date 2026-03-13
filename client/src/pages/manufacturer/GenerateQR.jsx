// client/src/pages/manufacturer/GenerateQR.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, Paper
} from '@mui/material';
import { ArrowBack, QrCode, Download } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import drugService from '../../services/drugService';

const GenerateQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState(searchParams.get('batchId') || '');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!batchId.trim()) { setError('Enter a valid Batch ID'); return; }
    setLoading(true); setError('');
    try {
      const result = await drugService.generateQR(batchId);
      setQrData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${batchId}.png`;
      link.click();
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/manufacturer')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Generate QR Code</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter a Batch ID to generate a verifiable QR code for drug authentication.
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth label="Batch ID" value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              InputProps={{ sx: { bgcolor: '#0d1117' } }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              variant="contained" onClick={handleGenerate} disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <QrCode />}
              sx={{ minWidth: 140, bgcolor: '#1f6feb' }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {qrData && (
        <Paper sx={{ p: 4, bgcolor: '#161b22', border: '1px solid #30363d', textAlign: 'center' }}>
          <Typography variant="h6" mb={2} fontWeight={700}>QR Code for Batch: {batchId}</Typography>
          <Box display="flex" justifyContent="center" mb={3}>
            <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1 }}>
              <QRCode
                id="qr-canvas"
                value={JSON.stringify({ batchId, verifyUrl: `${window.location.origin}/verify/${batchId}` })}
                size={256}
                level="H"
                includeMargin
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Scan to verify drug authenticity on SecureRxChain
          </Typography>
          <Button
            variant="outlined" startIcon={<Download />} onClick={handleDownload}
          >
            Download QR Code
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default GenerateQR;
