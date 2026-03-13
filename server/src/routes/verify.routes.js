const express = require('express');
const router = express.Router();

// Public verification endpoint (consumer-facing)
router.post('/qr', (req, res) => {
  const { batchId, qrHash } = req.body;
  res.json({ message: 'QR verification endpoint', batchId, qrHash });
});

router.get('/batch/:batchId', (req, res) => {
  res.json({ message: `Verify batch ${req.params.batchId}` });
});

module.exports = router;
