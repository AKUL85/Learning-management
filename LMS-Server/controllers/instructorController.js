const Profile = require('../models/Profile');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const cloudinary = require("../config/cloudinary");
const UPLOAD_REWARD = 500; 

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

exports.createCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.role !== "instructor")
      return res.status(403).json({ message: "Forbidden" });

    const { title, description, price } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // FIXED: Use 'image' instead of 'thumbnail'
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    let thumbnailUrl = "";
    let videoUrl = "";

    // Upload IMAGE to Cloudinary
    if (imageFile) {
      try {
        const img = await cloudinary.uploader.upload(imageFile.path, {
          folder: "teaching_app/images",
        });
        thumbnailUrl = img.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Upload VIDEO to Cloudinary
    if (videoFile) {
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
    }

    // Validate that files were uploaded
    if (!thumbnailUrl || !videoUrl) {
      return res.status(400).json({ message: "Both image and video are required" });
    }

    // Create course document
    const course = new Course({
      title,
      description,
      price: parseFloat(price),
      instructor_id: profile._id,
      instructor_name: profile.fullName,
      thumbnail_url: thumbnailUrl, // Cloudinary URL
      video_url: videoUrl,         // Cloudinary URL
      is_published: true,
    });

    await course.save();

    // Reward transaction
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
      course,
      transaction,
      profile,
    });
  } catch (err) {
    console.error("Create Course Error:", err);
    res.status(500).json({ message: "Server error" });
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


exports.createCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.role !== "instructor")
      return res.status(403).json({ message: "Forbidden" });

    const { title, description, price } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Files from multer
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    let thumbnailUrl = "";
    let videoUrl = "";

    // Upload IMAGE to Cloudinary
    if (imageFile) {
      const img = await cloudinary.uploader.upload(imageFile.path, {
        folder: "teaching_app/images",
      });
      thumbnailUrl = img.secure_url;
    }

    // Upload VIDEO to Cloudinary
    if (videoFile) {
      const vid = await cloudinary.uploader.upload(videoFile.path, {
        folder: "teaching_app/videos",
        resource_type: "video",
      });
      videoUrl = vid.secure_url;
    }

    // Create course document
    const course = new Course({
      title,
      description,
      price,
      instructor_id: profile._id,
      instructor_name: profile.fullName,
      thumbnail_url: thumbnailUrl, // Cloudinary URL
      video_url: videoUrl,         // Cloudinary URL
      is_published: true,
    });

    await course.save();

    // Reward transaction
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
      course,
      transaction,
      profile,
    });
  } catch (err) {
    console.error("Create Course Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
