const Profile = require('../models/Profile');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const cloudinary = require("../config/cloudinary");
const fs = require('fs');
const path = require('path');
const UPLOAD_REWARD = 500;

// Persistent directory for course materials
const materialsDir = path.join(__dirname, '..', 'uploads', 'materials');
if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true });
}

// Helper to clean up temp files after upload
const cleanupFiles = (files) => {
  if (!files) return;
  Object.values(files).flat().forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (err) { console.warn(`Cleanup failed: ${file.path}`, err); }
    }
  });
};

exports.createCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) {
      cleanupFiles(req.files);
      return res.status(404).json({ message: "Profile not found" });
    }
    if (profile.role !== "instructor") {
      cleanupFiles(req.files);
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, price, mcqs, cqs } = req.body;

    if (!title || !description || !price) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    if (!req.files || !req.files.image || !req.files.video) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: "Image and video files are required" });
    }

    let parsedMCQs = [];
    let parsedCQs = [];

    try {
      if (mcqs) parsedMCQs = JSON.parse(mcqs);
      if (cqs) parsedCQs = JSON.parse(cqs);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      cleanupFiles(req.files);
      return res.status(400).json({ message: "Invalid JSON format for MCQs or CQs" });
    }

    const imageFile = req.files.image[0];
    let thumbnailUrl = "";
    try {
      const img = await cloudinary.uploader.upload(imageFile.path, {
        folder: "teaching_app/images",
      });
      thumbnailUrl = img.secure_url;
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      cleanupFiles(req.files);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const videoFile = req.files.video[0];
    let videoUrl = "";
    try {
      const vid = await cloudinary.uploader.upload(videoFile.path, {
        folder: "teaching_app/videos",
        resource_type: "video",
      });
      videoUrl = vid.secure_url;
    } catch (uploadError) {
      console.error("Video upload error:", uploadError);
      cleanupFiles(req.files);
      return res.status(500).json({ message: "Failed to upload video" });
    }

    const materialFiles = req.files.materials || [];
    const materials = [];

    for (const file of materialFiles) {
      try {
        const ext = file.originalname.split('.').pop().toLowerCase();

        // Store materials locally instead of Cloudinary (raw file CDN delivery is blocked)
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const destPath = path.join(materialsDir, uniqueName);
        fs.renameSync(file.path, destPath);

        materials.push({
          id: uniqueName,
          title: file.originalname,
          type: ext,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          url: `/api/courses/materials/${uniqueName}/download`,
          downloaded: false
        });
      } catch (uploadError) {
        console.error("Material storage error:", uploadError);
      }
    }

    // Build content array with the intro video
    const courseContent = [];
    if (videoUrl) {
      courseContent.push({
        section: "Introduction",
        videos: [{
          title: "Course Overview",
          duration: "0:00",
          video_url: videoUrl
        }]
      });
    }

    const course = new Course({
      title,
      description,
      price: parseFloat(price),
      instructor_id: profile._id,
      instructor_name: profile.fullName,
      thumbnail_url: thumbnailUrl,
      materials,
      content: courseContent,
      mcqs: parsedMCQs,
      cqs: parsedCQs,
    });

    await course.save();

    // Clean up temp files after successful upload
    cleanupFiles(req.files);

    const transaction = new Transaction({
      type: "course_upload_reward",
      to_user_id: profile._id,
      course_id: course._id,
      amount: UPLOAD_REWARD,
      status: "completed",
      validated_at: new Date(),
    });

    await transaction.save();

    profile.bankBalance = (profile.bankBalance || 0) + UPLOAD_REWARD;
    await profile.save();

    res.status(201).json({
      message: "Course created successfully",
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail_url: course.thumbnail_url,
        instructor_name: course.instructor_name,
        materials: course.materials.length,
        content: course.content.length,
        mcqs_count: course.mcqs.length,
        cqs_count: course.cqs.length,
        created_at: course.createdAt
      },
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status
      },
      profile: {
        bankBalance: profile.bankBalance,
        fullName: profile.fullName
      }
    });

  } catch (err) {
    cleanupFiles(req.files);
    console.error("Create Course Error:", err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }

    res.status(500).json({
      message: err.message || "Server error while creating course"
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (profile.role !== 'instructor') return res.status(403).json({ message: 'Forbidden' });

    const courses = await Course.find({ instructor_id: profile._id.toString() }).sort({ createdAt: -1 });
    const transactions = await Transaction.find({ to_user_id: profile._id })
      .populate('course_id', 'title')
      .sort({ createdAt: -1 });

    // Count unique students enrolled in this instructor's courses
    const courseIds = courses.map(c => c._id);
    const totalStudents = await Profile.countDocuments({
      role: 'learner',
      enrolledCourses: { $in: courseIds }
    });

    res.json({ profile, courses, transactions, totalStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingTransactions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const pending = await Transaction.find({ to_user_id: profile._id, status: 'pending' }).sort({ createdAt: -1 });
    res.json({ pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.validateTransaction = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const txId = req.params.id;
    const tx = await Transaction.findById(txId);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (tx.to_user_id.toString() !== profile._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    if (tx.status === 'completed') return res.json({ message: 'Already completed', transaction: tx });

    tx.status = 'completed';
    tx.validated_at = new Date();
    await tx.save();

    profile.bankBalance = (profile.bankBalance || 0) + tx.amount;
    await profile.save();

    res.json({ message: 'Transaction validated', transaction: tx, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};