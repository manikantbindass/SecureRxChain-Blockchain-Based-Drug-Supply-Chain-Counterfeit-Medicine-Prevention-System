const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    return qrDataURL;
  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`);
  }
};

const generateQRBuffer = async (data) => {
  try {
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    const buffer = await QRCode.toBuffer(qrData, { width: 300 });
    return buffer;
  } catch (error) {
    throw new Error(`QR buffer generation failed: ${error.message}`);
  }
};

module.exports = { generateQRCode, generateQRBuffer };
