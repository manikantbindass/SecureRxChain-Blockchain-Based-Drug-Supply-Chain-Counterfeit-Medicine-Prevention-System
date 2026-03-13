import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default function BatchesPage() {
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>💊 Drug Batches</Typography>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            Batch management interface — connect wallet and fetch batches from blockchain.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
