
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['course_upload_reward', 'course_purchase', 'payout', 'wallet_recharge'], required: true },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  validated_at: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
