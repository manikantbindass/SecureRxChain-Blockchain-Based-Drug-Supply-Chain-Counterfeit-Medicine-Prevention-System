const User = require('../models/User');
const { generateAuthToken } = require('../utils/jwt.util');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { name, email, password, role, walletAddress, organizationName, licenseNumber, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered.',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'consumer',
    walletAddress,
    organizationName,
    licenseNumber,
    phone,
  });

  const token = generateAuthToken(user);

  logger.info(`New user registered: ${email} (${role})`);

  res.status(201).json({
    success: true,
    token,
    data: { user },
  });
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password.',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password.',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Account deactivated. Contact administrator.',
    });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateAuthToken(user);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    token,
    data: { user },
  });
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { user } });
};

/**
 * PUT /api/auth/update-profile
 */
exports.updateProfile = async (req, res) => {
  const { name, phone, organizationName, walletAddress } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, organizationName, walletAddress },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: { user } });
};

/**
 * POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  const token = generateAuthToken(user);

  res.json({ success: true, token, message: 'Password changed successfully.' });
};
