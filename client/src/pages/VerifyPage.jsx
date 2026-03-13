import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Chip } from '@mui/material';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function VerifyPage() {
  const [batchId, setBatchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/verify/batch/${batchId}`);
      setResult({ success: true, data: res.data });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
      sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #00ACC1 100%)' }}>
      <Card sx={{ width: 480, borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>🔍 Verify Medicine</Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={3}>
            Enter the batch ID from the QR code to verify authenticity
          </Typography>
          <TextField fullWidth label="Batch ID / QR Code" value={batchId}
            onChange={e => setBatchId(e.target.value)} margin="normal" />
          <Button fullWidth variant="contained" size="large" onClick={handleVerify}
            disabled={!batchId || loading} sx={{ mt: 1, borderRadius: 2 }}>
            Verify Now
          </Button>
          {result && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
              {result.success
                ? <><Chip label="AUTHENTIC" color="success" size="small" /> Drug batch verified on blockchain.</>
                : result.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
