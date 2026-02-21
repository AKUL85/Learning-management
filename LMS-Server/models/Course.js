const mongoose = require('mongoose');

// --- Sub-Schemas ---

const MaterialSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String },
  url: { type: String, required: true },
  downloaded: { type: Boolean, default: false }
}, { _id: false });

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  video_url: { type: String, required: true }
});

const ContentSchema = new mongoose.Schema({
  section: { type: String, required: true },
  videos: [VideoSchema]
});

const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct_option: { type: Number, required: true }
}, { _id: false });

const CQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  date: { type: Date, default: Date.now }
}, { _id: false });

const QASchema = new mongoose.Schema({
  question: { type: String, required: true },
  description: { type: String },
  author: { type: String, required: true },
  author_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  answer: { type: String },
  helpful: { type: Number, default: 0 },
  voters: [{ type: String }]
}, { _id: true });

// --- Main Course Schema ---
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  thumbnail_url: { type: String },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  instructor_name: { type: String },
  published_at: { type: Date },
  duration_hours: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  requirements: [{ type: String }],
  audience: [{ type: String }],
  objectives: [{ type: String }],

  materials: [MaterialSchema],
  content: [ContentSchema],
  mcqs: [MCQSchema],
  cqs: [CQSchema],
  reviews: [ReviewSchema],
  qa: [QASchema]
}, { timestamps: true });

CourseSchema.path('price').validate(function (value) {
  return value >= 0;
}, 'Price cannot be negative');

module.exports = mongoose.model('Course', CourseSchema);