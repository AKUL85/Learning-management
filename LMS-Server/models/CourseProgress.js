const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedVideos: [{ type: mongoose.Schema.Types.ObjectId }],
    isCompleted: { type: Boolean, default: false },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    percentage: { type: Number, default: 0 },
    completedAt: { type: Date },
    lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);
