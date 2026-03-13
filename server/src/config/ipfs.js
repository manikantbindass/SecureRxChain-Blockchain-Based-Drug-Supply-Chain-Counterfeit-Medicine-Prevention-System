const { create } = require('ipfs-http-client');
const logger = require('../utils/logger');

let ipfs = null;

const createIPFSClient = () => {
  try {
    const auth =
      process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET
        ? 'Basic ' +
          Buffer.from(
            process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
          ).toString('base64')
        : null;

    const config = {
      url: process.env.IPFS_ENDPOINT || 'https://ipfs.infura.io:5001',
    };

    if (auth) {
      config.headers = { authorization: auth };
    }

    ipfs = create(config);
    logger.info('IPFS client initialized');
    return ipfs;
  } catch (error) {
    logger.error('IPFS client initialization failed:', error.message);
    throw error;
  }
};

const getIPFS = () => {
  if (!ipfs) return createIPFSClient();
  return ipfs;
};

const uploadToIPFS = async (data) => {
  const client = getIPFS();
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const { cid } = await client.add(content);
  return cid.toString();
};

const getFromIPFS = async (cid) => {
  const client = getIPFS();
  const chunks = [];
  for await (const chunk of client.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

module.exports = {
  getIPFS,
  uploadToIPFS,
  getFromIPFS,
  createIPFSClient,
};
