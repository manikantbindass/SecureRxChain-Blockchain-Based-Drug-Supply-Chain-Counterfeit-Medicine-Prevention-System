const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  from: String,
  to: String,
  timestamp: { type: Date, default: Date.now },
  txHash: String,
  location: String,
});

const drugBatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true },
  txHash: { type: String },
  drugName: { type: String, required: true },
  genericName: String,
  manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  manufacturerAddress: String,
  quantity: { type: Number, required: true, min: 1 },
  manufactureDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  dosageForm: String,
  strength: String,
  ipfsDocHash: String,
  ipfsDocUrl: String,
  qrCodeHash: String,
  qrCodeImage: String,
  status: {
    type: String,
    enum: ['created', 'in_transit', 'delivered', 'sold', 'recalled'],
    default: 'created'
  },
  currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transferHistory: [transferSchema],
  isCounterfeit: { type: Boolean, default: false },
  counterfeitReports: [{ reporter: String, reason: String, timestamp: Date }],
  blockchainVerified: { type: Boolean, default: false },
  anomalyScore: { type: Number, default: 0 },
}, { timestamps: true });

drugBatchSchema.index({ drugName: 'text', 'manufacturer': 1 });
drugBatchSchema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model('DrugBatch', drugBatchSchema);
