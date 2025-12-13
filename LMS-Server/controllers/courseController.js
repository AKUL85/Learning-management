const Course = require('../models/Course');
const Profile = require('../models/Profile');
const Transaction = require('../models/Transaction');
const cloudinary = require("../config/cloudinary");
const fs = require('fs');

const UPLOAD_REWARD = 500;

exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ published_at: { $ne: null } }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    console.error('Error in getPublishedCourses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};


const cleanupFiles = (files) => {
  if (!files) return;
  Object.values(files).flat().forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
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
      return res.status(403).json({ message: "Forbidden: Only instructors can create courses" });
    }

    const { title, description, price, mcqs, cqs, requirements, audience } = req.body;

    if (!title || price === undefined) {
      cleanupFiles(req.files);
      return res.status(400).json({ message: "Title and price are required." });
    }

    let thumbnailUrl = "";
    let mainVideoUrl = "";
    const materials = [];

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        try {
          const img = await cloudinary.uploader.upload(req.files.image[0].path, {
            folder: "teaching_app/images",
          });
          thumbnailUrl = img.secure_url;
        } catch (e) {
          console.error("Image upload failed:", e);
        }
      }

      if (req.files.video && req.files.video[0]) {
        try {
          const vid = await cloudinary.uploader.upload(req.files.video[0].path, {
            folder: "teaching_app/videos",
            resource_type: "video",
          });
          mainVideoUrl = vid.secure_url;
        } catch (e) {
          console.error("Video upload failed:", e);
        }
      }

      if (req.files.materials) {
        for (const file of req.files.materials) {
          try {
            const ext = file.originalname.split('.').pop().toLowerCase();
            const isPdf = ext === 'pdf';
            const uploadConfig = {
              folder: "teaching_app/materials",
              resource_type: isPdf ? "raw" : "auto"
            };
            const result = await cloudinary.uploader.upload(file.path, uploadConfig);

            materials.push({
              id: result.public_id || Date.now().toString(),
              title: file.originalname,
              type: ext,
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
              url: result.secure_url,
              downloaded: false
            });
          } catch (e) {
            console.error("Material upload failed:", e);
          }
        }
      }
    }

    cleanupFiles(req.files);

    let parsedMCQs = [];
    let parsedCQs = [];
    try {
      if (mcqs) parsedMCQs = JSON.parse(mcqs);
      if (cqs) parsedCQs = JSON.parse(cqs);
    } catch (e) {
      console.warn("JSON parse error for MCQs/CQs", e);
    }

    const content = [];
    if (mainVideoUrl) {
      content.push({
        section: "Introduction",
        videos: [
          {
            title: "Course Overview",
            duration: "0:00",
            video_url: mainVideoUrl
          }
        ]
      });
    }

    let parsedRequirements = [];
    let parsedAudience = [];
    try {
      if (requirements) parsedRequirements = JSON.parse(requirements);
      if (audience) parsedAudience = JSON.parse(audience);
    } catch (e) {
      console.warn("JSON parse error for Requirements/Audience", e);
    }

    const newCourse = new Course({
      title,
      description,
      price: parseFloat(price),
      instructor_id: profile._id.toString(),
      instructor_name: profile.fullName,
      thumbnail_url: thumbnailUrl,
      published_at: new Date(),
      duration_hours: 0,
      materials,
      content,
      mcqs: parsedMCQs,
      cqs: parsedCQs,
      reviews: [],
      requirements: parsedRequirements,
      audience: parsedAudience
    });

    const savedCourse = await newCourse.save();

    const transaction = new Transaction({
      type: "course_upload_reward",
      to_user_id: profile._id,
      course_id: savedCourse._id,
      amount: UPLOAD_REWARD,
      status: "completed",
      validated_at: new Date(),
    });
    await transaction.save();

    profile.bankBalance = (profile.bankBalance || 0) + UPLOAD_REWARD;
    await profile.save();

    res.status(201).json(savedCourse);
  } catch (error) {
    cleanupFiles(req.files);
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    let course = await Course.findById(id).populate('instructor_id', 'username email');

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const userId = req.user;
    let hasAccess = false;

    if (userId) {
      if (course.instructor_id._id.toString() === userId) {
        hasAccess = true;
      } else {
        const profile = await Profile.findOne({ user: userId });
        if (profile) {
          if (profile.role === 'admin') {
            hasAccess = true;
          } else if (profile.enrolledCourses.includes(course._id)) {
            hasAccess = true;
          }
        }
      }
    }

    const courseData = course.toObject();

    if (!hasAccess) {
      if (courseData.content) {
        courseData.content = courseData.content.map(section => ({
          ...section,
          videos: section.videos.map(video => ({
            _id: video._id,
            title: video.title,
            isFree: video.isFree,
          }))
        }));
      }
      courseData.materials = [];
      courseData.mcqs = [];
      courseData.cqs = [];
    }

    const instructorId = course.instructor_id._id;

    const totalCourses = await Course.countDocuments({ instructor_id: instructorId });

    const instructorCourses = await Course.find({ instructor_id: instructorId }).select('_id');
    const instructorCourseIds = instructorCourses.map(c => c._id);

    const totalStudents = await Transaction.countDocuments({
      course_id: { $in: instructorCourseIds },
      type: 'course_purchase',
      status: 'completed'
    });

    const allCoursesWithReviews = await Course.find({ instructor_id: instructorId }).select('reviews');
    let totalRatingSum = 0;
    let totalReviewCount = 0;

    allCoursesWithReviews.forEach(c => {
      c.reviews.forEach(r => {
        totalRatingSum += r.rating;
        totalReviewCount++;
      });
    });

    const instructorRating = totalReviewCount > 0 ? (totalRatingSum / totalReviewCount).toFixed(1) : "N/A";


    res.json({
      course: courseData,
      instructorStats: {
        totalCourses,
        totalStudents,
        rating: instructorRating
      }
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course", error: error.message });
  }
};

const handleCourseUpdate = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      cleanupFiles(req.files);
      return res.status(404).json({ message: "Course not found" });
    }

    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) {
      cleanupFiles(req.files);
      return res.status(404).json({ message: "Profile not found" });
    }

    if (course.instructor_id !== profile._id.toString() && profile.role !== 'admin') {
      cleanupFiles(req.files);
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    const updates = {};
    const { title, description, price, thumbnail_url, requirements, audience, objectives, materials, content, mcqs, cqs } = req.body;

    const isValidString = (val) => val !== undefined && val !== null && val !== "null" && val !== "undefined" && typeof val === "string" && val.trim() !== "";

    if (isValidString(title)) updates.title = title.trim();
    if (isValidString(description)) updates.description = description.trim();

    if (price !== undefined && price !== null && price !== "" && price !== "null" && price !== "undefined") {
      const parsedPrice = parseFloat(price);
      if (Number.isFinite(parsedPrice) && parsedPrice >= 0) {
        updates.price = parsedPrice;
      }
    }

    if (isValidString(thumbnail_url)) {
      updates.thumbnail_url = thumbnail_url.trim();
    }

    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const img = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: "teaching_app/images",
        });
        updates.thumbnail_url = img.secure_url;
      } catch (e) {
        console.error("Image upload failed:", e);
      }
    }

    const parseArray = (val) => {
      if (Array.isArray(val)) return val;
      if (isValidString(val)) {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : null;
        } catch (e) { return null; }
      }
      return null;
    };

    const parsedReqs = parseArray(requirements);
    if (parsedReqs) updates.requirements = parsedReqs;

    const parsedAudience = parseArray(audience);
    if (parsedAudience) updates.audience = parsedAudience;

    const parsedObjs = parseArray(objectives);
    if (parsedObjs) updates.objectives = parsedObjs;

    const parsedMCQs = parseArray(mcqs);
    if (parsedMCQs) updates.mcqs = parsedMCQs;

    const parsedCQs = parseArray(cqs);
    if (parsedCQs) updates.cqs = parsedCQs;

    const existingMaterials = parseArray(materials);
    if (existingMaterials) {
      updates.materials = existingMaterials;
    }

    const existingContent = parseArray(content);
    if (existingContent) {
      updates.content = existingContent;
    }

    const newMaterialFiles = [];
    if (req.files && req.files.materials) {
      for (const file of req.files.materials) {
        try {
          const ext = file.originalname.split('.').pop().toLowerCase();
          const isPdf = ext === 'pdf';
          const uploadConfig = {
            folder: "teaching_app/materials",
            resource_type: isPdf ? "raw" : "auto"
          };
          const result = await cloudinary.uploader.upload(file.path, uploadConfig);
          newMaterialFiles.push({
            id: result.public_id || Date.now().toString(),
            title: file.originalname,
            type: ext,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            url: result.secure_url,
            downloaded: false
          });
        } catch (e) { console.error("Mat upload fail", e); }
      }
    }

    let newContentBlock = null;
    if (req.files && req.files.video && req.files.video[0]) {
      try {
        const vid = await cloudinary.uploader.upload(req.files.video[0].path, {
          folder: "teaching_app/videos",
          resource_type: "video"
        });
        newContentBlock = {
          section: `Module ${course.content ? course.content.length + 1 : 1}`,
          videos: [{
            title: "New Lesson",
            duration: "0:00",
            video_url: vid.secure_url
          }]
        };
      } catch (e) { console.error("Vid upload fail", e); }
    }

    cleanupFiles(req.files);

    const updateOps = { $set: updates };
    const pushOps = {};

    if (newMaterialFiles.length > 0) {
      if (updates.materials) {
        updates.materials = [...updates.materials, ...newMaterialFiles];
      } else {
        pushOps.materials = { $each: newMaterialFiles };
      }
    }

    if (newContentBlock) {
      if (updates.content) {
        updates.content.push(newContentBlock);
      } else {
        pushOps.content = newContentBlock;
      }
    }

    if (Object.keys(pushOps).length > 0) {
      updateOps.$push = pushOps;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateOps,
      { new: true, runValidators: true }
    );

    res.json(updatedCourse);

  } catch (error) {
    cleanupFiles(req.files);
    console.error("Error updating course:", error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

exports.updateCourse = handleCourseUpdate;
exports.partialUpdateCourse = handleCourseUpdate;

exports.deleteCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const profile = await Profile.findOne({ user: req.user.userId });
    if (course.instructor_id !== profile._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existingReview = course.reviews.find(r => r.user === userId);
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this course" });
    }

    course.reviews.push({
      user: userId,
      rating,
      comment,
      date: new Date()
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review" });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = req.user.userId;

    const profile = await Profile.findOne({ user: userId });
    const authorName = profile ? profile.fullName : "Student";

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.qa.push({
      question: title,
      description: body,
      author: authorName,
      author_id: userId,
      date: new Date()
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Error adding question" });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { id, qaId } = req.params;
    const { answer } = req.body;
    const userId = req.user.userId;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const profile = await Profile.findOne({ user: userId });
    if (course.instructor_id !== profile._id.toString()) {
      return res.status(403).json({ message: "Only the instructor can answer questions" });
    }

    const question = course.qa.id(qaId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.answer = answer;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error("Error answering question:", error);
    res.status(500).json({ message: "Error answering question" });
  }
};
