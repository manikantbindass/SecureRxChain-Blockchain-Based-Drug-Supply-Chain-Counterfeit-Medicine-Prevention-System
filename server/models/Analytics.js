const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    totalDrugsRegistered: { type: Number, default: 0 },
    totalTransfers: { type: Number, default: 0 },
    totalVerifications: { type: Number, default: 0 },
    counterfeitDetected: { type: Number, default: 0 },
    quarantinedDrugs: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
