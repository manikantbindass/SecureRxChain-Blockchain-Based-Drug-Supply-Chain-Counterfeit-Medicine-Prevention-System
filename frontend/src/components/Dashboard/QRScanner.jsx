import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false);

    scanner.render(
      (result) => {
        scanner.clear();
        setScanResult(result);
        if(result.includes('/verify/')) {
            const batchId = result.split('/verify/')[1];
            navigate(`/verify/${batchId}`);
        } else {
            navigate(`/verify/${result}`);
        }
      },
      () => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [navigate]);

  return (
    <Box mt={4} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <Typography variant="h5" mb={3}>Scan Drug QR Code</Typography>
        <div id="reader"></div>
        {scanResult && <Typography mt={2}>Scan Success: {scanResult}</Typography>}
      </Paper>
    </Box>
  );
};

export default QRScanner;
