
const Course = require('../models/Course');

exports.getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_published: true });
    res.json({ courses });  
  } catch (error) {
    console.error('Error in getPublishedCourses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};
