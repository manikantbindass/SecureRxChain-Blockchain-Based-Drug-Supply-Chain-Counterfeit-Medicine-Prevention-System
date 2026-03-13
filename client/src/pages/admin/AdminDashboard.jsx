// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Alert, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AdminPanelSettings, Inventory, People, Warning } from '@mui/icons-material';
import drugService from '../../services/drugService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#c62828', '#7b1fa2', '#0288d1'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await drugService.getAnalytics();
      setAnalytics(data);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const stats = analytics?.stats || {};
  const stateData = analytics?.stateDistribution || [];
  const monthlyData = analytics?.monthlyRegistrations || [];
  const recentDrugs = analytics?.recentDrugs || [];

  const statCards = [
    { label: 'Total Drugs', value: stats.totalDrugs || 0, icon: <Inventory />, color: '#1976d2' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <People />, color: '#388e3c' },
    { label: 'Quarantined', value: stats.quarantined || 0, icon: <Warning />, color: '#c62828' },
    { label: 'Transactions', value: stats.transactions || 0, icon: <AdminPanelSettings />, color: '#7b1fa2' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Admin Dashboard</Typography>
        <Typography color="text.secondary">Welcome, {user?.name} — System Overview</Typography>
      </Box>

      <Grid container spacing={2} mb={4}>
        {statCards.map(s => (
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

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Monthly Drug Registrations</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                  <Line type="monotone" dataKey="count" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Drug State Distribution</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stateData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Registrations by Role</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.roleStats || []}>
              <XAxis dataKey="role" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
              <Bar dataKey="count" fill="#1f6feb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Drug Registrations</Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#0d1117' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch ID</TableCell>
                  <TableCell>Drug Name</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDrugs.map(d => (
                  <TableRow key={d._id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{d.batchId}</TableCell>
                    <TableCell>{d.drugName}</TableCell>
                    <TableCell>{d.manufacturer?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={d.currentState} size="small"
                        color={d.currentState === 'quarantined' ? 'error' : d.currentState === 'sold' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!recentDrugs.length && (
                  <TableRow><TableCell colSpan={5} align="center">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
