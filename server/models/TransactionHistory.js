// server/models/TransactionHistory.js
// Complete transaction history schema with compound indexes and geolocation support

const mongoose = require('mongoose');

// -----------------------------------------
// Sub-schema: GeoLocation (optional)
// -----------------------------------------
const GeoLocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

// -----------------------------------------
// Main TransactionHistory Schema
// -----------------------------------------
const TransactionHistorySchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      trim: true,
      index: true,
    },

    from: {
      address: {
        type: String,
        required: [true, 'Sender address/ID is required'],
        trim: true,
      },
      name: { type: String, trim: true },
      role: {
        type: String,
        enum: ['manufacturer', 'distributor', 'pharmacy', 'regulator', 'consumer', 'system'],
        default: 'manufacturer',
      },
      userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    to: {
      address: {
        type: String,
        required: [true, 'Recipient address/ID is required'],
        trim: true,
      },
      name: { type: String, trim: true },
      role: {
        type: String,
        enum: ['manufacturer', 'distributor', 'pharmacy', 'regulator', 'consumer', 'system'],
        default: 'distributor',
      },
      userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    state: {
      type: String,
      enum: [
        'registered',
        'in_transit',
        'delivered',
        'quarantined',
        'recalled',
        'verified',
        'rejected',
        'expired',
      ],
      required: [true, 'State is required'],
      index: true,
    },

    previousState: {
      type: String,
      enum: [
        'registered',
        'in_transit',
        'delivered',
        'quarantined',
        'recalled',
        'verified',
        'rejected',
        'expired',
        null,
      ],
      default: null,
    },

    txHash: {
      type: String,
      trim: true,
      sparse: true,
    },

    blockNumber: {
      type: Number,
      default: null,
    },

    gasUsed: {
      type: String,
      default: null,
    },

    location: {
      type: GeoLocationSchema,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: null,
    },

    isOnChain: {
      type: Boolean,
      default: false,
    },

    ipfsLogHash: {
      type: String,
      trim: true,
      default: null,
    },

    anomalyFlag: {
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

// Primary: fast lookup by batchId + time desc (for history view)
TransactionHistorySchema.index({ batchId: 1, timestamp: -1 });

// Fast lookup by sender wallet
TransactionHistorySchema.index({ 'from.address': 1 });

// Fast lookup by recipient wallet
TransactionHistorySchema.index({ 'to.address': 1 });

// Filter by state
TransactionHistorySchema.index({ state: 1 });

// Blockchain tx hash lookup
TransactionHistorySchema.index({ txHash: 1 }, { sparse: true });

// Anomaly flag queries
TransactionHistorySchema.index({ anomalyFlag: 1 });

// Geo-spatial index for location-based queries
TransactionHistorySchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

// Compound: batchId + state for filtered history
TransactionHistorySchema.index({ batchId: 1, state: 1 });

// -----------------------------------------
// Virtuals
// -----------------------------------------
TransactionHistorySchema.virtual('isBlockchainConfirmed').get(function () {
  return this.isOnChain && !!this.txHash;
});

TransactionHistorySchema.virtual('formattedTimestamp').get(function () {
  if (!this.timestamp) return null;
  return this.timestamp.toISOString();
});

// -----------------------------------------
// Static Methods
// -----------------------------------------

// Get full transfer timeline for a batch
TransactionHistorySchema.statics.getTimelineByBatch = function (batchId) {
  return this.find({ batchId })
    .sort({ timestamp: 1 })
    .populate('from.userRef', 'name email role')
    .populate('to.userRef', 'name email role');
};

// Get latest state for a batch
TransactionHistorySchema.statics.getLatestState = function (batchId) {
  return this.findOne({ batchId })
    .sort({ timestamp: -1 })
    .select('state batchId timestamp from to txHash isOnChain');
};

// Count anomalous transactions
TransactionHistorySchema.statics.countAnomalies = function () {
  return this.countDocuments({ anomalyFlag: true });
};

module.exports = mongoose.model('TransactionHistory', TransactionHistorySchema);
