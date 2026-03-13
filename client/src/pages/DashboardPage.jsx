import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const StatCard = ({ title, value, color, icon }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" color="text.secondary">{icon} {title}</Typography>
      <Typography variant="h3" color={color} fontWeight={700}>{value}</Typography>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { account, isConnected, connect } = useWeb3();

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4">Welcome back, {user?.name} 👋</Typography>
          <Typography color="text.secondary">SecureRxChain Dashboard</Typography>
        </Box>
        <Chip
          label={isConnected ? `${account?.slice(0,6)}...${account?.slice(-4)}` : 'Connect Wallet'}
          color={isConnected ? 'success' : 'default'}
          onClick={!isConnected ? connect : undefined}
          sx={{ cursor: !isConnected ? 'pointer' : 'default' }}
        />
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Batches" value="—" color="primary.main" icon="💊" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="In Transit" value="—" color="warning.main" icon="🚚" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Verified Today" value="—" color="success.main" icon="✅" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Anomalies" value="—" color="error.main" icon="⚠️" />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>📊 Recent Activity</Typography>
        <Typography color="text.secondary">No recent activity yet. Start by creating a drug batch.</Typography>
      </Card>
    </Box>
  );
}
