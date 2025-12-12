const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  

  thumbnail_url: { type: String },
  video_url: { type: String },
  

  materials: [{ 
    filename: String,
    url: String,
    originalname: String,
    size: Number
  }],
  

  mcqs: { type: Array, default: [] },
  cqs: { type: Array, default: [] },
  
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  instructor_name: { type: String },
  is_published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);