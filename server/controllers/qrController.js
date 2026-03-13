const Drug = require('../models/Drug');
const { generateQRCode, generateQRBuffer } = require('../utils/qrGenerator');

// @desc   Generate or regenerate QR code for a drug batch
// @route  POST /api/qr/generate
const generateQR = async (req, res, next) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    const drug = await Drug.findOne({ batchId });
    if (!drug) return res.status(404).json({ success: false, message: 'Drug batch not found' });

    const qrPayload = {
      batchId: drug.batchId,
      name: drug.name,
      manufacturer: drug.manufacturer,
      expiryDate: drug.expiryDate,
      verifyUrl: `${process.env.APP_URL}/api/drugs/verify/${batchId}`,
    };

    const qrCode = await generateQRCode(qrPayload);

    drug.qrCode = qrCode;
    await drug.save();

    res.status(200).json({
      success: true,
      message: 'QR Code generated',
      data: { batchId, qrCode },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateQR };
