import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default function AnomaliesPage() {
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>⚠️ Anomaly Detection</Typography>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            AI-powered anomaly detection dashboard — displays flagged supply chain activities.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
