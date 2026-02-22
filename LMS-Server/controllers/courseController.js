const Course = require('../models/Course');
const Profile = require('../models/Profile');
const Transaction = require('../models/Transaction');
const cloudinary = require("../config/cloudinary");
const fs = require('fs');

const UPLOAD_REWARD = 500;

exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    console.error('Error in getPublishedCourses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};


// Helper to clean up temp files if something goes wrong during upload
const cleanupFiles = (uploadedFiles) => {
  if (!uploadedFiles) return;

  // multer groups files by field name, so we flatten them to get a simple list
  Object.values(uploadedFiles).flat().forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn(`Failed to cleanup file: ${file.path}`, err);
      }
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

    let courseThumbnail = "";
    let introVideo = "";
    const materialsList = [];

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        try {
          const uploadedImg = await cloudinary.uploader.upload(req.files.image[0].path, {
            folder: "teaching_app/images",
          });
          courseThumbnail = uploadedImg.secure_url;
        } catch (err) {
          console.error("Thumbnail upload failed:", err);
        }
      }

      if (req.files.video && req.files.video[0]) {
        try {
          const uploadedVid = await cloudinary.uploader.upload(req.files.video[0].path, {
            folder: "teaching_app/videos",
            resource_type: "video",
          });
          introVideo = uploadedVid.secure_url;
        } catch (err) {
          console.error("Intro video upload failed:", err);
        }
      }

      if (req.files.materials) {
        for (const file of req.files.materials) {
          try {
            const fileExt = file.originalname.split('.').pop().toLowerCase();
            const isPdf = fileExt === 'pdf';

            const uploadConfig = {
              folder: "teaching_app/materials",
              resource_type: isPdf ? "raw" : "auto"
            };

            const result = await cloudinary.uploader.upload(file.path, uploadConfig);

            materialsList.push({
              id: result.public_id || Date.now().toString(),
              title: file.originalname,
              type: fileExt,
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
              url: result.secure_url,
              downloaded: false
            });
          } catch (err) {
            console.error(`Failed to upload material: ${file.originalname}`, err);
          }
        }
      }
    }

    cleanupFiles(req.files);

    let mcqList = [];
    let cqList = [];
    try {
      if (mcqs) mcqList = JSON.parse(mcqs);
      if (cqs) cqList = JSON.parse(cqs);
    } catch (err) {
      console.warn("Could not parse MCQs or CQs structure", err);
    }

    const courseContent = [];
    if (introVideo) {
      courseContent.push({
        section: "Introduction",
        videos: [
          {
            title: "Course Overview",
            duration: "0:00",
            video_url: introVideo
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
      thumbnail_url: courseThumbnail,
      published_at: null,
      duration_hours: 0,
      materials: materialsList,
      content: courseContent,
      mcqs: mcqList,
      cqs: cqList,
      reviews: [],
      requirements: parsedRequirements,
      audience: parsedAudience
    });

    const savedCourse = await newCourse.save();



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

    // Grab the course and populate the instructor details we want to show
    let course = await Course.findById(id).populate({
      path: 'instructor_id',
      select: 'fullName speciality profession skills bio user',
      populate: { path: 'user', select: 'email' }
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const currentUserId = req.user ? req.user.userId : null;
    let userHasAccess = false;

    if (currentUserId) {
      const userProfile = await Profile.findOne({ user: currentUserId });
      if (userProfile) {
        const isInstructor = course.instructor_id._id.toString() === userProfile._id.toString(); // Note: populated instructor_id is an object now
        const isAdmin = userProfile.role === 'admin';
        const isEnrolled = userProfile.enrolledCourses && userProfile.enrolledCourses.map(cid => cid.toString()).includes(course._id.toString());

        if (isInstructor || isAdmin || isEnrolled) {
          userHasAccess = true;
        }
      }
    }

    const coursePayload = course.toObject();

    // If they don't have access, strip out the paid content
    if (!userHasAccess) {
      if (coursePayload.content) {
        coursePayload.content = coursePayload.content.map(section => ({
          ...section,
          videos: section.videos.map(video => ({
            _id: video._id,
            title: video.title,
            isFree: video.isFree,
            // URL is hidden
          }))
        }));
      }
      // Clear other protected data
      coursePayload.materials = [];
      coursePayload.mcqs = [];
      coursePayload.cqs = [];
    }

    // Get instructor stats for the side panel
    const instructorId = course.instructor_id._id;

    const totalCourses = await Course.countDocuments({ instructor_id: instructorId, status: 'approved' });

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
      course: coursePayload,
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

    if (course.instructor_id.toString() !== profile._id.toString() && profile.role !== 'admin') {
      cleanupFiles(req.files);
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    const updates = {};
    const {
      title, description, price, thumbnail_url, requirements, audience,
      objectives, materials, content, mcqs, cqs,
      video_title, material_titles
    } = req.body;

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

    // Handle new Course Image upload
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

    // Helper to safely parse JSON arrays from multipart form data
    const parseArray = (val) => {
      if (Array.isArray(val)) return val;
      if (isValidString(val)) {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : null;
        } catch (e) {
          return null;
        }
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

    // Parse material titles mapping if provided
    let parsedMaterialTitles = {};
    try {
      if (material_titles) {
        parsedMaterialTitles = JSON.parse(material_titles); // Expected: { "filename.pdf": "Custom Title", ... }
      }
    } catch (e) {
      console.warn("Failed to parse material_titles", e);
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

          // Use custom title if available, else filename
          const fileTitle = parsedMaterialTitles[file.originalname] || file.originalname;

          newMaterialFiles.push({
            id: result.public_id || Date.now().toString(),
            title: fileTitle,
            type: ext,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            url: result.secure_url,
            downloaded: false
          });
        } catch (e) { console.error("Mat upload fail", e); }
      }
    }

    let parsedVideoTitles = {};
    try {
      if (video_title) {
        // Fallback for single video legacy upload (though frontend now sends array)
        parsedVideoTitles['default'] = video_title;
      }
      if (req.body.video_titles) {
        parsedVideoTitles = JSON.parse(req.body.video_titles);
      }
    } catch (e) { console.warn("Failed to parse video_titles", e); }

    const newContentBlocks = [];
    if (req.files && req.files.video) {
      // req.files.video is an array
      for (const file of req.files.video) {
        try {
          const uploadedVid = await cloudinary.uploader.upload(file.path, {
            folder: "teaching_app/videos",
            resource_type: "video"
          });

          // If we have a custom title for this specific file, use it
          const customTitle = parsedVideoTitles[file.originalname] || file.originalname.replace(/\.[^/.]+$/, "") || "New Lesson";

          newContentBlocks.push({
            // Simply append to the end as a new module for now
            section: `Module ${course.content ? course.content.length + newContentBlocks.length + 1 : newContentBlocks.length + 1}`,
            videos: [{
              title: customTitle,
              duration: "0:00",
              video_url: uploadedVid.secure_url
            }]
          });
        } catch (err) {
          console.error(`Video upload failed for ${file.originalname}`, err);
        }
      }
    }

    cleanupFiles(req.files);

    const updateOps = { $set: updates };
    const pushOps = {};

    if (newMaterialFiles.length > 0) {
      if (updates.materials) {
        // If we are replacing materials entirely (rare in partial update but possible), append new ones
        updates.materials = [...updates.materials, ...newMaterialFiles];
      } else {
        // Otherwise just push to existing
        pushOps.materials = { $each: newMaterialFiles };
      }
    }

    if (newContentBlocks.length > 0) {
      if (updates.content) {
        updates.content.push(...newContentBlocks);
      } else {
        pushOps.content = { $each: newContentBlocks };
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
    if (course.instructor_id.toString() !== profile._id.toString()) {
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
    if (course.instructor_id.toString() !== profile._id.toString()) {
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
