const { create } = require('ipfs-http-client');

let ipfs;

const getIPFS = () => {
  if (!ipfs) {
    ipfs = create({
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'https',
      headers: {
        authorization:
          'Basic ' +
          Buffer.from(
            process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET
          ).toString('base64'),
      },
    });
  }
  return ipfs;
};

module.exports = { getIPFS };
