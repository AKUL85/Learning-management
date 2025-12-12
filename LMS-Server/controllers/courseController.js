const Course = require('../models/Course');

// GET all published courses
exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_published: true });
    res.json({ courses });
  } catch (error) {
    console.error('Error in getPublishedCourses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

// ✅ GET a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ course });
  } catch (error) {
    console.error("Error in getCourseById:", error);
    res.status(500).json({ message: "Error fetching course details" });
  }
};
