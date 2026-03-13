const QRCode = require('qrcode');
const crypto = require('crypto');

const generateQRBuffer = async (text, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 1,
    scale: 6,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    ...options,
  };
  return QRCode.toBuffer(text, defaultOptions);
};

const generateQRDataURL = async (text, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 4,
    ...options,
  };
  return QRCode.toDataURL(text, defaultOptions);
};

const generateQRString = async (text, options = {}) => {
  return QRCode.toString(text, {
    type: 'utf8',
    ...options,
  });
};

const hashQRPayload = (payload) => {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
};

const buildQRPayload = (batchId, additionalData = {}) => {
  return JSON.stringify({
    batchId,
    verifyUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${batchId}`,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

module.exports = {
  generateQRBuffer,
  generateQRDataURL,
  generateQRString,
  hashQRPayload,
  buildQRPayload,
};
