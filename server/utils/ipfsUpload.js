const { getIPFS } = require('../config/ipfs');

const uploadToIPFS = async (data) => {
  try {
    const ipfs = getIPFS();
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    const { cid } = await ipfs.add(content);
    const ipfsHash = cid.toString();
    return ipfsHash;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

const getFromIPFS = async (hash) => {
  try {
    const ipfs = getIPFS();
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
};

module.exports = { uploadToIPFS, getFromIPFS };
