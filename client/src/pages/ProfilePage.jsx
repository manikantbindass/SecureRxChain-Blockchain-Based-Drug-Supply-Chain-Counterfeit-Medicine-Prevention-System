import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>👤 Profile</Typography>
      <Card sx={{ borderRadius: 3, maxWidth: 500 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}>
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h5">{user?.name}</Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          <Chip label={user?.role?.toUpperCase()} color="primary" sx={{ width: 'fit-content' }} />
          {user?.organizationName && <Typography>🏢 {user.organizationName}</Typography>}
          {user?.walletAddress && <Typography variant="body2" color="text.secondary">🔑 {user.walletAddress}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}
