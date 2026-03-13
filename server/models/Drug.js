// server/models/Drug.js
// Enhanced Drug batch schema - links to DrugMetadata and TransactionHistory
// Serves as the on-chain anchor record in MongoDB

const mongoose = require('mongoose');

// -----------------------------------------
// Sub-schema: Transfer event (embedded)
// -----------------------------------------
const TransferSchema = new mongoose.Schema(
  {
    from: {
      address: { type: String, required: true, trim: true },
      name: { type: String, trim: true },
      role: {
        type: String,
        enum: ['manufacturer', 'distributor', 'pharmacy', 'regulator', 'consumer', 'system'],
      },
    },
    to: {
      address: { type: String, required: true, trim: true },
      name: { type: String, trim: true },
      role: {
        type: String,
        enum: ['manufacturer', 'distributor', 'pharmacy', 'regulator', 'consumer', 'system'],
      },
    },
    timestamp: { type: Date, default: Date.now },
    txHash: { type: String, trim: true },
    blockNumber: { type: Number, default: null },
    location: { type: String, trim: true },
    state: {
      type: String,
      enum: ['registered', 'in_transit', 'delivered', 'quarantined', 'recalled', 'verified'],
      required: true,
    },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { _id: true, timestamps: false }
);

// -----------------------------------------
// Main Drug Schema
// -----------------------------------------
const DrugSchema = new mongoose.Schema(
  {
    // Core identifiers
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

    // Reference to DrugMetadata (full details + IPFS)
    metadataRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DrugMetadata',
      default: null,
    },

    // Manufacturer info
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },

    manufacturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    manufacturerWallet: {
      type: String,
      trim: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum wallet address'],
    },

    // Dates
    manufacturingDate: {
      type: Date,
      required: [true, 'Manufacturing date is required'],
    },

    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
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

    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
    },

    // Current supply chain status
    status: {
      type: String,
      enum: ['pending', 'active', 'in_transit', 'delivered', 'quarantined', 'recalled', 'expired', 'verified'],
      default: 'pending',
      index: true,
    },

    // Current holder wallet
    currentOwnerWallet: {
      type: String,
      trim: true,
    },

    currentOwnerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Blockchain
    onChainTxHash: {
      type: String,
      trim: true,
      default: null,
    },

    onChainRegisteredAt: {
      type: Date,
      default: null,
    },

    blockNumber: {
      type: Number,
      default: null,
    },

    isRegisteredOnChain: {
      type: Boolean,
      default: false,
    },

    // IPFS
    ipfsMetadataHash: {
      type: String,
      trim: true,
      default: null,
    },

    // QR Code
    qrCodeDataUrl: {
      type: String,
      default: null,
    },

    qrSecret: {
      type: String,
      select: false,
      default: null,
    },

    // Embedded transfer history (lightweight, for quick rendering)
    transferHistory: {
      type: [TransferSchema],
      default: [],
    },

    // Quarantine / Recall
    quarantineReason: {
      type: String,
      trim: true,
      default: null,
    },

    quarantinedAt: {
      type: Date,
      default: null,
    },

    quarantinedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    isQuarantined: {
      type: Boolean,
      default: false,
    },

    // Flags
    anomalyFlagged: {
      type: Boolean,
      default: false,
    },

    anomalyDetails: {
      type: String,
      trim: true,
      default: null,
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
DrugSchema.index({ batchId: 1 }, { unique: true });
DrugSchema.index({ status: 1 });
DrugSchema.index({ manufacturerId: 1 });
DrugSchema.index({ manufacturerWallet: 1 });
DrugSchema.index({ currentOwnerWallet: 1 });
DrugSchema.index({ expiryDate: 1 });
DrugSchema.index({ isRegisteredOnChain: 1 });
DrugSchema.index({ createdAt: -1 });
DrugSchema.index({ anomalyFlagged: 1 });
// Compound: status + expiry (for dashboard queries)
DrugSchema.index({ status: 1, expiryDate: 1 });

// -----------------------------------------
// Virtuals
// -----------------------------------------
DrugSchema.virtual('isExpired').get(function () {
  return this.expiryDate && new Date() > this.expiryDate;
});

DrugSchema.virtual('transferCount').get(function () {
  return this.transferHistory ? this.transferHistory.length : 0;
});

DrugSchema.virtual('verifyUrl').get(function () {
  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${base}/verify/${this.batchId}`;
});

// -----------------------------------------
// Static Methods
// -----------------------------------------

// Find by batchId with full population
DrugSchema.statics.findByBatch = function (batchId) {
  return this.findOne({ batchId })
    .populate('manufacturerId', 'name email walletAddress organization')
    .populate('currentOwnerRef', 'name email role walletAddress')
    .populate('metadataRef');
};

// Find all quarantined drugs
DrugSchema.statics.findQuarantined = function () {
  return this.find({ isQuarantined: true }).sort({ quarantinedAt: -1 });
};

module.exports = mongoose.model('Drug', DrugSchema);
