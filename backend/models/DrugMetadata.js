const mongoose = require('mongoose');

const DrugMetadataSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String },
  ingredients: [String],
  imageURL: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DrugMetadata', DrugMetadataSchema);
