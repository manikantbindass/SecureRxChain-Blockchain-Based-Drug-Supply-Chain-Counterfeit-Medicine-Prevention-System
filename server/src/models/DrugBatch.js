const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    from: { type: String },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: String },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    location: { type: String },
    notes: { type: String },
    txHash: { type: String },
    blockNumber: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const drugBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      unique: true,
      index: true,
    },
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
    },
    genericName: { type: String, trim: true },
    dosageForm: { type: String, trim: true },
    strength: { type: String, trim: true },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    manufacturerName: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
    quantity: { type: Number, min: 1 },
    ipfsCID: { type: String },
    qrCodeData: { type: String },
    qrCodeHash: { type: String },
    currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentOwnerWallet: { type: String },
    status: {
      type: String,
      enum: ['Manufactured', 'InTransit', 'Distributed', 'Retailed', 'Sold', 'Quarantined', 'Recalled'],
      default: 'Manufactured',
    },
    isCounterfeit: { type: Boolean, default: false },
    isRecalled: { type: Boolean, default: false },
    quarantineReason: { type: String },
    registrationTxHash: { type: String },
    transfers: [transferSchema],
    verificationCount: { type: Number, default: 0 },
    lastVerifiedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
drugBatchSchema.index({ batchId: 1 });
drugBatchSchema.index({ status: 1 });
drugBatchSchema.index({ manufacturer: 1 });
drugBatchSchema.index({ expiryDate: 1 });
drugBatchSchema.index({ drugName: 'text', genericName: 'text' });

// Virtual: isExpired
drugBatchSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

module.exports = mongoose.model('DrugBatch', drugBatchSchema);
