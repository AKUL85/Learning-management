const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['learner', 'instructor'], required: true },
  bankAccount: { type: String, default: null },
  bankBalance: { type: Number, default: 1000.00 },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
