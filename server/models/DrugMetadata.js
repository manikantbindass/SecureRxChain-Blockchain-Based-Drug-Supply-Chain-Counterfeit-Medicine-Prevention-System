// server/models/DrugMetadata.js
// Full drug metadata schema with IPFS hashes, certificates, and manufacturer reference

const mongoose = require('mongoose');

// -----------------------------------------
// Sub-schema: Image
// -----------------------------------------
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    ipfsHash: { type: String, trim: true },
    label: { type: String, trim: true, default: 'Drug Image' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// -----------------------------------------
// Sub-schema: Certificate
// -----------------------------------------
const CertificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certificate name is required'],
      trim: true,
    },
    issuer: { type: String, trim: true },
    issuedAt: { type: Date },
    validTill: { type: Date },
    documentUrl: { type: String, trim: true },
    ipfsHash: { type: String, trim: true },
    certType: {
      type: String,
      enum: ['GMP', 'FDA', 'ISO', 'WHO', 'CE', 'OTHER'],
      default: 'OTHER',
    },
  },
  { _id: false }
);

// -----------------------------------------
// Sub-schema: Manufacturer
// -----------------------------------------
const ManufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Manufacturer name is required'],
      trim: true,
    },
    licenseNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    contactPhone: { type: String, trim: true },
    walletAddress: {
      type: String,
      trim: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum wallet address'],
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

// -----------------------------------------
// Main DrugMetadata Schema
// -----------------------------------------
const DrugMetadataSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      unique: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
    },

    genericName: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    composition: {
      type: String,
      trim: true,
    },

    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'other'],
      default: 'tablet',
    },

    strength: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
    },

    unit: {
      type: String,
      enum: ['mg', 'mcg', 'g', 'ml', 'units', 'IU'],
      default: 'mg',
    },

    manufacturingDate: {
      type: Date,
      required: [true, 'Manufacturing date is required'],
    },

    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    storageConditions: {
      type: String,
      trim: true,
      default: 'Store below 25 degrees C in a dry place',
    },

    images: {
      type: [ImageSchema],
      default: [],
    },

    certificates: {
      type: [CertificateSchema],
      default: [],
    },

    sideEffects: {
      type: [String],
      default: [],
    },

    contraindications: {
      type: [String],
      default: [],
    },

    interactions: {
      type: [String],
      default: [],
    },

    manufacturer: {
      type: ManufacturerSchema,
      required: [true, 'Manufacturer info is required'],
    },

    ipfsMetadataHash: {
      type: String,
      trim: true,
    },

    onChainTxHash: {
      type: String,
      trim: true,
    },

    qrCodeDataUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ['active', 'recalled', 'quarantined', 'expired', 'pending'],
      default: 'pending',
      index: true,
    },

    isVerifiedOnChain: {
      type: Boolean,
      default: false,
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
DrugMetadataSchema.index({ batchId: 1 }, { unique: true });
DrugMetadataSchema.index({ 'manufacturer.name': 1 });
DrugMetadataSchema.index({ 'manufacturer.walletAddress': 1 });
DrugMetadataSchema.index({ status: 1 });
DrugMetadataSchema.index({ expiryDate: 1 });
DrugMetadataSchema.index({ createdAt: -1 });

// -----------------------------------------
// Virtuals
// -----------------------------------------
DrugMetadataSchema.virtual('isExpired').get(function () {
  return this.expiryDate && new Date() > this.expiryDate;
});

DrugMetadataSchema.virtual('daysToExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diff = this.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('DrugMetadata', DrugMetadataSchema);
