
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, default: 0 },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  instructor_name: { type: String },
  is_published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
