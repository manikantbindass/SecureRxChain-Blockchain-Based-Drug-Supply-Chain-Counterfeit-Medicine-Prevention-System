const jwt = require('jsonwebtoken');

const signToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'SecureRxChain',
    audience: 'securerxchain-api',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'SecureRxChain',
    audience: 'securerxchain-api',
  });
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const generateAuthToken = (user) => {
  return signToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_EXPIRES_IN || '7d'
  );
};

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  generateAuthToken,
};
