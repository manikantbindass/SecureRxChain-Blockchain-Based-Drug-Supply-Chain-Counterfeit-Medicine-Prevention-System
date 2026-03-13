// server/models/User.js
// Production-ready User schema with bcrypt hashing, RBAC, and email index

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['manufacturer', 'distributor', 'pharmacy', 'regulator', 'consumer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'consumer',
      index: true,
    },

    walletAddress: {
      type: String,
      trim: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum wallet address'],
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    organization: {
      type: String,
      trim: true,
      default: null,
    },

    licenseNumber: {
      type: String,
      trim: true,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// -----------------------------------------
// Indexes
// -----------------------------------------
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ walletAddress: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });

// -----------------------------------------
// Pre-save Hook: hash password before save
// -----------------------------------------
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// -----------------------------------------
// Instance Methods
// -----------------------------------------

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Return safe user object (strip sensitive fields)
UserSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// -----------------------------------------
// Virtuals
// -----------------------------------------
UserSchema.virtual('fullRole').get(function () {
  const roleMap = {
    admin: 'System Administrator',
    manufacturer: 'Drug Manufacturer',
    distributor: 'Drug Distributor',
    pharmacy: 'Pharmacy/Retailer',
    regulator: 'Regulatory Authority',
    consumer: 'End Consumer',
  };
  return roleMap[this.role] || this.role;
});

module.exports = mongoose.model('User', UserSchema);
