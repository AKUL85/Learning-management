const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');

exports.getProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const progress = await CourseProgress.findOne({ user: userId, course: courseId });
        res.json({ progress: progress || null });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await CourseProgress.find({ user: userId });
        res.json({ progress });
    } catch (error) {
        console.error('Get all progress error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const { videoId } = req.body;

        let progress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!progress) {
            progress = new CourseProgress({ user: userId, course: courseId, completedVideos: [] });
        }

        if (!progress.completedVideos.includes(videoId)) {
            progress.completedVideos.push(videoId);
        }

        const course = await Course.findById(courseId);
        if (course) {
            let totalVideos = 0;
            course.content.forEach(section => {
                totalVideos += section.videos.length;
            });

            if (progress.completedVideos.length >= totalVideos && totalVideos > 0) {
                progress.isCompleted = true;
                if (!progress.completedAt) progress.completedAt = new Date();
            }
        }

        progress.lastAccessed = new Date();
        await progress.save();

        res.json({ progress });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
