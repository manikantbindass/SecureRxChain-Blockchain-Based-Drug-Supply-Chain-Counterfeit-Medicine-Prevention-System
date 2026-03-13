const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const DrugBatch = require('../models/DrugBatch');
const { generateQRCode } = require('../utils/qr.util');
const logger = require('../utils/logger');

/**
 * POST /api/qr/generate
 */
exports.generateQR = async (req, res) => {
  const { batchId } = req.body;

  if (!batchId) {
    return res.status(400).json({ success: false, message: 'batchId is required' });
  }

  const batch = await DrugBatch.findOne({ batchId });
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${batchId}`;

  const qrDataUrl = await generateQRCode(verifyUrl);

  logger.info(`QR generated for batch ${batchId}`);

  res.json({
    success: true,
    data: {
      batchId,
      qrCode: qrDataUrl,
      verifyUrl,
    },
  });
};

/**
 * GET /api/qr/verify/:batchId
 */
exports.verifyQR = async (req, res) => {
  const { batchId } = req.params;

  const batch = await DrugBatch.findOne({ batchId })
    .populate('manufacturer', 'name organizationName')
    .populate('transferHistory.from', 'name role')
    .populate('transferHistory.to', 'name role');

  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  res.json({
    success: true,
    data: batch,
  });
};
