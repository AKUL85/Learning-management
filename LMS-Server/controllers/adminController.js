const Profile = require('../models/Profile');
const Course = require('../models/Course');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getStats = async (req, res) => {
    try {
        const revenueTxns = await Transaction.find({ type: 'course_purchase', status: 'completed' });
        const totalRevenue = revenueTxns.reduce((acc, txn) => acc + txn.amount, 0);

        const instructorTxns = await Transaction.find({ type: 'course_upload_reward', status: 'completed' });
        const instructorEarnings = instructorTxns.reduce((acc, txn) => acc + txn.amount, 0);

        const purchaseCount = revenueTxns.length;

        const totalLearners = await Profile.countDocuments({ role: 'learner' });
        const totalInstructors = await Profile.countDocuments({ role: 'instructor' });

        res.status(200).json({
            totalRevenue,
            instructorEarnings,
            purchaseCount,
            totalLearners,
            totalInstructors
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

exports.getBalances = async (req, res) => {
    try {
        const adminProfile = await Profile.findOne({ role: 'admin' });
        const systemBalance = adminProfile ? adminProfile.bankBalance : 0;

        const instructors = await Profile.find({ role: 'instructor' }).select('fullName bankBalance');
        const learners = await Profile.find({ role: 'learner' }).select('fullName bankBalance');

        res.status(200).json({
            systemBalance,
            instructors,
            learners
        });
    } catch (error) {
        console.error('Error fetching balances:', error);
        res.status(500).json({ message: 'Server error fetching balances' });
    }
};

exports.getPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'pending' }).populate('instructor_id', 'fullName');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pending courses' });
    }
};

exports.approveCourse = async (req, res) => {
    const { courseId } = req.params;
    const UPLOAD_REWARD_AMOUNT = 500;

    try {
        const activeCoursesCount = await Course.countDocuments({ status: 'approved' });
        if (activeCoursesCount >= 5) {
            return res.status(400).json({ message: 'Course limit reached. Cannot approve more than 5 courses.' });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.status === 'approved') return res.status(400).json({ message: 'Course already approved' });

        const adminProfile = await Profile.findOne({ role: 'admin' });
        if (!adminProfile) return res.status(500).json({ message: 'Admin profile not found. Cannot process payment.' });

        if (adminProfile.bankBalance < UPLOAD_REWARD_AMOUNT) {
            return res.status(400).json({ message: 'Insufficient system funds to pay instructor.' });
        }

        let instructorProfile = await Profile.findOne({ user: course.instructor_id });
        if (!instructorProfile) {
            instructorProfile = await Profile.findById(course.instructor_id);
        }

        if (!instructorProfile) return res.status(404).json({ message: 'Instructor profile not found' });

        adminProfile.bankBalance -= UPLOAD_REWARD_AMOUNT;
        await adminProfile.save();

        instructorProfile.bankBalance += UPLOAD_REWARD_AMOUNT;
        await instructorProfile.save();

        await Transaction.create({
            type: 'course_upload_reward',
            to_user_id: instructorProfile._id,
            course_id: course._id,
            amount: UPLOAD_REWARD_AMOUNT,
            status: 'completed',
            validated_at: new Date()
        });

        course.status = 'approved';
        await course.save();

        res.status(200).json({ message: 'Course approved and instructor paid successfully.', course });

    } catch (error) {
        console.error('Error approving course:', error);
        res.status(500).json({ message: 'Server error approving course' });
    }
};

exports.rejectCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.status = 'rejected';
        await course.save();

        res.status(200).json({ message: 'Course rejected.', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error rejecting course' });
    }
};

exports.getInstructorDetails = async (req, res) => {
    const { profileId } = req.params;
    try {
        const profile = await Profile.findById(profileId).populate('user', 'email');
        if (!profile) return res.status(404).json({ message: 'Instructor not found' });

        const courses = await Course.find({ instructor_id: profile._id.toString() });

        const earningsTxns = await Transaction.find({
            to_user_id: profile._id,
            type: 'course_upload_reward',
            status: 'completed'
        });
        const totalEarnings = earningsTxns.reduce((acc, curr) => acc + curr.amount, 0);

        const courseIds = courses.map(c => c._id);
        const purchaseTxns = await Transaction.find({
            course_id: { $in: courseIds },
            type: 'course_purchase',
            status: 'completed'
        }).distinct('to_user_id');

        const studentsCount = await Profile.countDocuments({
            role: 'learner',
            enrolledCourses: { $in: courseIds }
        });

        res.json({
            profile,
            courses,
            totalEarnings,
            studentsCount
        });

    } catch (error) {
        console.error('Error fetching instructor details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLearnerDetails = async (req, res) => {
    const { profileId } = req.params;
    try {
        const profile = await Profile.findById(profileId).populate('user', 'email').populate('enrolledCourses');
        if (!profile) return res.status(404).json({ message: 'Learner not found' });

        const CourseProgress = require('../models/CourseProgress');

        const enrolledWithProgress = await Promise.all(profile.enrolledCourses.map(async (course) => {
            const progress = await CourseProgress.findOne({ user: profile.user, course: course._id });

            let percent = 0;
            if (progress && course.content) {
                const totalVideos = course.content.reduce((acc, sec) => acc + sec.videos.length, 0);
                const completed = progress.completedVideos.length;
                percent = totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0;
            }

            return {
                ...course.toObject(),
                progressPercent: percent,
                lastAccessed: progress ? progress.lastAccessed : null
            };
        }));

        res.json({
            profile,
            enrolledCourses: enrolledWithProgress
        });

    } catch (error) {
        console.error('Error fetching learner details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor_id', 'fullName').sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all courses' });
    }
};

exports.deleteCourseByAdmin = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        res.json({ message: 'Course deleted by admin', courseId });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting course' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const profiles = await Profile.find()
            .populate('user', 'email')
            .select('fullName role bankBalance user');

        res.status(200).json(profiles);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};
