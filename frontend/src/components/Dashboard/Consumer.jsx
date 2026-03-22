import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Card, CardContent, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const Consumer = () => {
  const { id } = useParams(); // Using React Router to get ID
  const [drugData, setDrugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrug = async () => {
      try {
        const res = await api.get(`/drugs/verify/${id}`);
        setDrugData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to verify drug. It may be counterfeit.');
      } finally {
        setLoading(false);
      }
    };
    if(id) fetchDrug();
  }, [id]);

  if (loading) return <Box mt={10} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box mt={4} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: '700px' }}>
        <Typography variant="h5" mb={3}>Consumer Verification Portal</Typography>
        
        {error ? (
          <Alert severity="error">
             ⚠️ {error}
          </Alert>
        ) : (
          <>
            <Alert severity={drugData.isAuthentic ? "success" : "error"} sx={{ mb: 3 }}>
              {drugData.isAuthentic ? "✅ This drug is Authentic and registered on the Blockchain." : "❌ WARNING: Drug has been quarantined or flagged!"}
            </Alert>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Drug Information: {drugData.onChainData.drugName}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1"><b>Batch ID:</b> {id}</Typography>
                <Typography variant="body1"><b>Manufacturing Date:</b> {new Date(drugData.onChainData.manufacturingDate * 1000).toLocaleDateString()}</Typography>
                <Typography variant="body1"><b>Expiry Date:</b> {new Date(drugData.onChainData.expiryDate * 1000).toLocaleDateString()}</Typography>
                <Typography variant="body1"><b>Quantity in Batch:</b> {drugData.onChainData.quantity}</Typography>
                <Typography variant="body1" mt={1}><b>Description:</b> {drugData.offChainData?.description}</Typography>
                <Typography variant="body1" mt={1} color={drugData.aiRiskScore > 30 ? "error" : "success.main"}><b>[AI] Counterfeit Risk Score:</b> {drugData.aiRiskScore}% (Lower is better)</Typography>
              </CardContent>
            </Card>

            <Typography variant="h6" mb={2}>Supply Chain Provenance History</Typography>
            {drugData.history.map((step, index) => (
              <Box key={index} p={2} mb={2} borderLeft={4} borderColor="primary.main" bgcolor="#f5f5f5">
                <Typography variant="subtitle1"><b>{index === 0 ? "Manufacturer" : index === drugData.history.length - 1 ? "Current Owner" : "Transferred To"}:</b> {step.name} ({step.role})</Typography>
                <Typography variant="body2" color="textSecondary">{step.address}</Typography>
              </Box>
            ))}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Consumer;
