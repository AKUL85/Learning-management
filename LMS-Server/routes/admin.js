const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/Auth');
const Profile = require('../models/Profile');

const isAdmin = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.userId });
        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        req.profile = profile;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking admin privileges' });
    }
};

router.use(auth);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/balances', adminController.getBalances);
router.get('/users', adminController.getAllUsers);

router.get('/courses/pending', adminController.getPendingCourses);
router.get('/courses/all', adminController.getAllCourses);
router.delete('/courses/:courseId', adminController.deleteCourseByAdmin);
router.post('/courses/:courseId/approve', adminController.approveCourse);
router.post('/courses/:courseId/reject', adminController.rejectCourse);

router.get('/users/instructor/:profileId', adminController.getInstructorDetails);
router.get('/users/learner/:profileId', adminController.getLearnerDetails);

module.exports = router;
