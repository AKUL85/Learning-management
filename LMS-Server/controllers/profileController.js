const Profile = require('../models/Profile');
const CourseProgress = require('../models/CourseProgress');

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = await Profile.findOne({ user: userId })
      .populate('enrolledCourses')
      .populate('user', 'email')
      .lean();

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // For each enrolled course, find the progress
    const enrichedEnrolledCourses = await Promise.all(profile.enrolledCourses.map(async (course) => {
      const progress = await CourseProgress.findOne({ user: userId, course: course._id }).lean();
      return {
        ...course,
        course_id: course._id,
        is_completed: progress?.isCompleted || false,
        progress_percentage: progress?.percentage || 0,
        certificate_url: progress?.isCompleted ? `http://localhost:4000/api/progress/${userId}/${course._id}/certificate` : null
      };
    }));

    profile.enrolledCourses = enrichedEnrolledCourses;
    
    // Ensure these fields are always present
    profile.coursesCompleted = profile.coursesCompleted || 0;
    profile.coursesPurchased = profile.coursesPurchased || 0;

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const profile = await Profile.findOneAndUpdate({ user: userId }, updates, { new: true });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
