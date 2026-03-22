const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { 
    type: String, 
    enum: ['admin', 'manufacturer', 'distributor', 'pharmacy', 'consumer'],
    default: 'consumer'
  },
  walletAddress: { type: String },
  privateKey: { type: String } // For localhost seamless simulation
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
