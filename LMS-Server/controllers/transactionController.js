const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const mongoose = require('mongoose');

async function updateBalance(userId, amount, session) {
    const profile = await Profile.findOne({ user: userId }).session(session);
    if (!profile) throw new Error('Profile not found');
    profile.bankBalance = (profile.bankBalance || 0) + amount;
    await profile.save({ session });
    return profile;
}

exports.rechargeWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId, amount } = req.body;

        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }

        const transaction = new Transaction({
            type: 'wallet_recharge',
            to_user_id: userId,
            amount: amount,
            status: 'completed',
            top_up: true
        });

        const profile = await Profile.findOne({ user: userId }).session(session);
        if (!profile) throw new Error('Profile not found');

        transaction.to_user_id = profile._id;
        await transaction.save({ session });

        profile.bankBalance = (profile.bankBalance || 0) + Number(amount);
        await profile.save({ session });

        await session.commitTransaction();
        res.json({ success: true, newBalance: profile.bankBalance, message: 'Wallet recharged successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Recharge error:', error);
        res.status(400).json({ message: error.message || 'Recharge failed' });
    } finally {
        session.endSession();
    }
};

exports.purchaseCourse = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId, courseId } = req.body;

        const course = await Course.findById(courseId).session(session);
        if (!course) throw new Error('Course not found');

        const price = course.price;

        const profile = await Profile.findOne({ user: userId }).session(session);
        if (!profile) throw new Error('Profile not found');

        if (profile.enrolledCourses && profile.enrolledCourses.includes(courseId)) {
            throw new Error('Already enrolled in this course');
        }

        if (profile.bankBalance < price) {
            throw new Error('Insufficient wallet balance');
        }

        profile.bankBalance -= price;

        profile.enrolledCourses.push(courseId);
        await profile.save({ session });

        const purchaseTx = new Transaction({
            type: 'course_purchase',
            to_user_id: profile._id,
            course_id: courseId,
            amount: price,
            status: 'completed'
        });
        await purchaseTx.save({ session });

        const existingProgress = await CourseProgress.findOne({ user: userId, course: courseId }).session(session);
        if (!existingProgress) {
            const newProgress = new CourseProgress({
                user: userId,
                course: courseId,
                completedVideos: [],
                isCompleted: false
            });
            await newProgress.save({ session });
        }

        await session.commitTransaction();
        res.json({ success: true, message: 'Course purchased successfully', newBalance: profile.bankBalance });
    } catch (error) {
        await session.abortTransaction();
        console.error('Purchase error:', error);
        res.status(400).json({ message: error.message || 'Purchase failed' });
    } finally {
        session.endSession();
    }
};
