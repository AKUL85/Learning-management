const Profile = require('../models/Profile');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const cloudinary = require("../config/cloudinary");
const UPLOAD_REWARD = 500; 

// Add this to your Course model (models/Course.js) if not already there:
// materials: [{ filename: String, url: String, originalname: String, size: Number }],
// mcqs: { type: Array, default: [] },
// cqs: { type: Array, default: [] },

exports.createCourse = async (req, res) => {
  try {
    // Authentication & Authorization
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.role !== "instructor")
      return res.status(403).json({ message: "Forbidden" });

    // Parse JSON data from FormData
    const { title, description, price, mcqs, cqs } = req.body;
    
    // Validate required fields
    if (!title || !description || !price) {
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    // Check if files were uploaded
    if (!req.files || !req.files.image || !req.files.video) {
      return res.status(400).json({ message: "Image and video files are required" });
    }

    // Parse MCQs and CQs from JSON strings
    let parsedMCQs = [];
    let parsedCQs = [];
    
    try {
      if (mcqs) parsedMCQs = JSON.parse(mcqs);
      if (cqs) parsedCQs = JSON.parse(cqs);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return res.status(400).json({ message: "Invalid JSON format for MCQs or CQs" });
    }

    // Upload image to Cloudinary
    const imageFile = req.files.image[0];
    let thumbnailUrl = "";
    try {
      const img = await cloudinary.uploader.upload(imageFile.path, {
        folder: "teaching_app/images",
      });
      thumbnailUrl = img.secure_url;
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    // Upload video to Cloudinary
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
      return res.status(500).json({ message: "Failed to upload video" });
    }

    // Upload materials to Cloudinary (if any)
    const materialFiles = req.files.materials || [];
    const materials = [];
    
    for (const file of materialFiles) {
      try {
        // Determine resource type based on file extension
        const ext = file.originalname.split('.').pop().toLowerCase();
        const isPdf = ext === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        
        const uploadConfig = {
          folder: "teaching_app/materials",
          resource_type: "auto" // Let Cloudinary auto-detect
        };
        
        // For PDFs, use raw upload
        if (isPdf) {
          uploadConfig.resource_type = "raw";
        }
        
        const result = await cloudinary.uploader.upload(file.path, uploadConfig);
        
        materials.push({
          filename: file.filename,
          url: result.secure_url,
          originalname: file.originalname,
          size: file.size,
          public_id: result.public_id
        });
      } catch (uploadError) {
        console.error("Material upload error:", uploadError);
        // Continue with other materials even if one fails
        // Or return error if you want strict validation
      }
    }

    // Create course with all data
    const course = new Course({
      title,
      description,
      price: parseFloat(price),
      instructor_id: profile._id,
      instructor_name: profile.fullName,
      thumbnail_url: thumbnailUrl,
      video_url: videoUrl,
      materials,
      mcqs: parsedMCQs,
      cqs: parsedCQs,
      is_published: true,
    });

    await course.save();

    // Create reward transaction
    const transaction = new Transaction({
      type: "course_upload_reward",
      to_user_id: profile._id,
      course_id: course._id,
      amount: UPLOAD_REWARD,
      status: "completed",
      validated_at: new Date(),
    });

    await transaction.save();

    // Update instructor's balance
    profile.bankBalance = (profile.bankBalance || 0) + UPLOAD_REWARD;
    await profile.save();

    // Clean up local files (optional - if you want to delete after upload)
    const fs = require('fs');
    const path = require('path');
    
    // Delete all uploaded temp files
    const filesToDelete = [
      imageFile,
      videoFile,
      ...materialFiles
    ];
    
    filesToDelete.forEach(file => {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    // Return success response
    res.status(201).json({
      message: "Course created successfully",
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        thumbnail_url: course.thumbnail_url,
        video_url: course.video_url,
        instructor_name: course.instructor_name,
        materials: course.materials.length,
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
    console.error("Create Course Error:", err);
    
    // Clean up any uploaded Cloudinary files on error
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

// Other existing functions remain the same...
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (profile.role !== 'instructor') return res.status(403).json({ message: 'Forbidden' });

    const courses = await Course.find({ instructor_id: profile._id }).sort({ createdAt: -1 });
    const transactions = await Transaction.find({ to_user_id: profile._id }).sort({ createdAt: -1 });

    res.json({ profile, courses, transactions });
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