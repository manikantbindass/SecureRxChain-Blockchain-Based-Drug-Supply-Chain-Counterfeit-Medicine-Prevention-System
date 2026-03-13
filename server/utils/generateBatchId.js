const crypto = require('crypto');

const generateBatchId = (manufacturer, drugName, date) => {
  const raw = `${manufacturer}-${drugName}-${date}-${crypto.randomBytes(4).toString('hex')}`;
  return 'BATCH-' + crypto.createHash('sha256').update(raw).digest('hex').substring(0, 12).toUpperCase();
};

module.exports = { generateBatchId };
