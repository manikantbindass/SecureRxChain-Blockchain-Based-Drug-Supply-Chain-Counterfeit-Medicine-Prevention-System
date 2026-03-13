const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Placeholder controllers — implement in controllers/batch.controller.js
router.get('/', protect, (req, res) => res.json({ message: 'List all batches' }));
router.post('/', protect, restrictTo('manufacturer'), (req, res) => res.json({ message: 'Create batch' }));
router.get('/:batchId', protect, (req, res) => res.json({ message: `Get batch ${req.params.batchId}` }));
router.put('/:batchId/transfer', protect, (req, res) => res.json({ message: 'Transfer batch' }));
router.post('/:batchId/recall', protect, restrictTo('admin', 'regulator'), (req, res) => res.json({ message: 'Recall batch' }));
router.get('/:batchId/history', protect, (req, res) => res.json({ message: 'Get transfer history' }));
router.get('/:batchId/qr', (req, res) => res.json({ message: 'Get QR code' }));

module.exports = router;
