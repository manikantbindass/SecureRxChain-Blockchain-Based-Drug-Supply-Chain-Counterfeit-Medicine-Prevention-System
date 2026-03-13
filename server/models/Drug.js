const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  txHash: { type: String },
  location: { type: String },
  notes: { type: String },
});

const DrugSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    composition: { type: String },
    quantity: { type: Number, required: true },
    currentOwner: { type: String },
    currentOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['active', 'in_transit', 'delivered', 'quarantined', 'recalled'],
      default: 'active',
    },
    ipfsHash: { type: String },
    blockchainTxHash: { type: String },
    transferHistory: [TransferSchema],
    isQuarantined: { type: Boolean, default: false },
    quarantineReason: { type: String },
    qrCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drug', DrugSchema);
