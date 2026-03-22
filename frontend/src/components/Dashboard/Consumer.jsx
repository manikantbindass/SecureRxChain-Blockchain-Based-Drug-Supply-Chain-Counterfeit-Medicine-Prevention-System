import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Card, CardContent, Divider, Button, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ShieldAlert, ShieldCheck, Activity, Link as LinkIcon, AlertTriangle, Fingerprint, MapPin } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Consumer = () => {
  const { id } = useParams(); // Using React Router to get ID
  const navigate = useNavigate();
  const { web3Account, connectWallet } = useContext(AuthContext);
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
    if (id) {
      setLoading(true);
      fetchDrug();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="premium-bg">
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="premium-bg">
      <Box sx={{ animation: 'fadeIn 0.8s ease-out', width: '100%', maxWidth: '800px', mx: 2 }}>
        <Paper elevation={0} className="glass-panel" sx={{ padding: { xs: 3, md: 5 } }}>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(30,60,114,0.1)', mr: 2 }}>
                <Fingerprint size={28} color="#1e3c72" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="800" color="#1e3c72">Verification Portal</Typography>
                <Typography variant="body2" color="textSecondary">Consumer Medicine Authenticity Validator</Typography>
              </Box>
            </Box>
            {!web3Account && (
              <Button onClick={connectWallet} variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(45deg, #f6851b, #e2761b)', color: '#fff', fontWeight: 'bold' }}>
                Connect MetaMask
              </Button>
            )}
            {web3Account && (
              <Chip label="Wallet Connected" color="success" variant="outlined" sx={{ fontWeight: 'bold', borderColor: 'green' }}/>
            )}
          </Box>

          {!id && !drugData && (
             <Box textAlign="center" py={5}>
               <Typography variant="h6" color="textSecondary">Please scan a Drug QR Code to verify its authenticity and provenance.</Typography>
               <Button variant="outlined" onClick={() => navigate('/qrscanner')} sx={{ mt: 3, borderRadius: 8, borderColor: '#1e3c72', color: '#1e3c72' }}>
                 Open QR Scanner
               </Button>
             </Box>
          )}

          {error && (
            <Alert severity="error" icon={<AlertTriangle />} sx={{ borderRadius: 2, mb: 3 }}>
               <Typography variant="subtitle1" fontWeight="bold">Verification Failed</Typography>
               {error}
            </Alert>
          )}

          {drugData && !error && (
            <Box sx={{ animation: 'slideUp 0.5s ease' }}>
              <Alert 
                severity={drugData.isAuthentic ? "success" : "error"} 
                icon={drugData.isAuthentic ? <ShieldCheck size={28} /> : <ShieldAlert size={28}/>}
                sx={{ mb: 4, borderRadius: 3, display: 'flex', alignItems: 'center' }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {drugData.isAuthentic ? "Authentic: Blockchain Verified" : "WARNING: Counterfeit or Tampered"}
                </Typography>
                <Typography variant="body2">
                  This batch hash uniquely matches the immutable ledger record.
                </Typography>
              </Alert>
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mb={4}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,60,114,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="#1e3c72" fontWeight="bold" display="flex" alignItems="center" mb={1}>
                      <Activity size={20} style={{ marginRight: '8px' }}/> AI Risk Analysis
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="textSecondary">Probability Score</Typography>
                      <Typography variant="h6" fontWeight="bold" color={drugData.aiRiskScore > 40 ? "error" : "success.main"}>
                        {drugData.aiRiskScore}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="textSecondary">Classification</Typography>
                      <Chip size="small" label={drugData.aiClassification || "Authentic"} color={drugData.aiRiskScore > 40 ? "error" : "success"} />
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(30,60,114,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="#1e3c72" fontWeight="bold" display="flex" alignItems="center" mb={1}>
                      <Fingerprint size={20} style={{ marginRight: '8px' }}/> Batch Metadata
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" mb={0.5}><b>Name:</b> {drugData.onChainData.drugName}</Typography>
                    <Typography variant="body2" mb={0.5}><b>Batch ID:</b> {id}</Typography>
                    <Typography variant="body2" mb={0.5}><b>Manufactured:</b> {new Date(drugData.onChainData.manufacturingDate * 1000).toLocaleDateString()}</Typography>
                    <Typography variant="body2"><b>Expires:</b> {new Date(drugData.onChainData.expiryDate * 1000).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              </Box>

              <Typography variant="h6" mb={2} color="#1e3c72" fontWeight="bold" display="flex" alignItems="center">
                <LinkIcon size={20} style={{ marginRight: '8px' }}/> Supply Chain Provenance Map
              </Typography>
              
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.4)', p: 3, borderRadius: 3, border: '1px solid rgba(30,60,114,0.1)' }}>
                {drugData.history.map((step, index) => (
                  <Box key={index} display="flex" mb={index === drugData.history.length - 1 ? 0 : 3}>
                    <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: index === 0 ? 'primary.main' : index === drugData.history.length - 1 ? 'success.main' : 'info.main' }} />
                      {index !== drugData.history.length - 1 && <Box sx={{ width: 2, height: '100%', bgcolor: 'rgba(30,60,114,0.2)', my: 0.5 }} />}
                    </Box>
                    <Box pb={2}>
                      <Typography variant="subtitle2" fontWeight="bold" color="#1e3c72" display="flex" alignItems="center">
                        <MapPin size={14} style={{ marginRight: '4px' }}/> 
                        {index === 0 ? "Manufactured By" : index === drugData.history.length - 1 ? "Current Custodian" : "Transited Through"}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">{step.name} <Chip size="small" label={step.role} sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} /></Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>{step.address}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
            </Box>
          )}

        </Paper>
      </Box>
    </Box>
  );
};

export default Consumer;
