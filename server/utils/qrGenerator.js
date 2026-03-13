// server/utils/qrGenerator.js
// Complete QR Code generation utility for SecureRxChain
const QRCode = require('qrcode');

const BASE_VERIFY_URL = process.env.FRONTEND_URL || 'https://securerxchain.com';

/**
 * Build the canonical verification URL embedded in QR
 * Format: https://securerxchain.com/verify/{batchId}
 */
const buildVerifyURL = (batchId) => {
  return `${BASE_VERIFY_URL}/verify/${batchId}`;
};

/**
 * Build the full QR payload (URL + metadata)
 * Scanners that read JSON will get rich data;
 * plain URL scanners open the verify page directly.
 */
const buildQRPayload = (batchId, drugName, manufacturer) => {
  // Primary value is the URL so any generic scanner works
  return buildVerifyURL(batchId);
};

/**
 * Generate QR as base64 Data URL (for embedding in API responses / emails)
 * @param {string} batchId
 * @param {string} [drugName]
 * @param {string} [manufacturer]
 * @returns {Promise<string>} - data:image/png;base64,...
 */
const generateQRDataURL = async (batchId, drugName = '', manufacturer = '') => {
  try {
    const payload = buildQRPayload(batchId, drugName, manufacturer);
    const dataURL = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',   // Highest error correction (30% damage tolerance)
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#0d1117',    // GitHub dark bg — clean black modules
        light: '#ffffff',
      },
    });
    return dataURL;
  } catch (error) {
    throw new Error(`QR DataURL generation failed: ${error.message}`);
  }
};

/**
 * Generate QR as raw PNG Buffer (for saving to disk / IPFS upload)
 */
const generateQRBuffer = async (batchId, drugName = '', manufacturer = '') => {
  try {
    const payload = buildQRPayload(batchId, drugName, manufacturer);
    const buffer = await QRCode.toBuffer(payload, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
    });
    return buffer;
  } catch (error) {
    throw new Error(`QR Buffer generation failed: ${error.message}`);
  }
};

/**
 * Generate QR as SVG string (for high-quality print / PDF)
 */
const generateQRSVG = async (batchId, drugName = '', manufacturer = '') => {
  try {
    const payload = buildQRPayload(batchId, drugName, manufacturer);
    const svg = await QRCode.toString(payload, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });
    return svg;
  } catch (error) {
    throw new Error(`QR SVG generation failed: ${error.message}`);
  }
};

/**
 * Full QR generation result returned when a drug batch is registered.
 * Returns both the data URL (for API response) and the verify URL.
 */
const generateDrugQR = async (batchId, drugName = '', manufacturer = '') => {
  const verifyURL = buildVerifyURL(batchId);
  const qrDataURL = await generateQRDataURL(batchId, drugName, manufacturer);
  return {
    batchId,
    verifyURL,
    qrDataURL,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  buildVerifyURL,
  buildQRPayload,
  generateQRDataURL,
  generateQRBuffer,
  generateQRSVG,
  generateDrugQR,
};
