const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Profile = require('../models/Profile');
const PDFDocument = require('pdfkit');

exports.getCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const progress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!progress || !progress.isCompleted) {
            return res.status(403).json({ message: 'Course not completed yet' });
        }

        const course = await Course.findById(courseId);
        const profile = await Profile.findOne({ user: userId });

        if (!course || !profile) {
            return res.status(404).json({ message: 'Course or Profile not found' });
        }

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${courseId}.pdf`);

        doc.pipe(res);

        // Certificate Background and Border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(10).stroke('#00B4D8');
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(2).stroke('#03045E');

        // Certificate Header
        doc.fontSize(40).fillColor('#03045E').text('CERTIFICATE', { align: 'center', underline: true });
        doc.moveDown();
        doc.fontSize(20).text('OF COMPLETION', { align: 'center' });
        doc.moveDown(2);

        // Student Info
        doc.fontSize(16).fillColor('#444').text('This is to certify that', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(30).fillColor('#000').text(profile.fullName, { align: 'center', bold: true });
        doc.moveDown(0.5);
        doc.fontSize(16).fillColor('#444').text('has successfully completed the course', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(24).fillColor('#03045E').text(course.title, { align: 'center' });
        doc.moveDown(2);

        // Date and ID
        const dateStr = progress.completedAt ? progress.completedAt.toLocaleDateString() : new Date().toLocaleDateString();
        doc.fontSize(12).fillColor('#666').text(`Completion Date: ${dateStr}`, { align: 'center' });
        doc.text(`Certificate ID: ${progress._id}`, { align: 'center' });

        // Signature area
        doc.moveDown(2);
        const signatureLineY = doc.y;
        doc.moveTo(150, signatureLineY).lineTo(350, signatureLineY).stroke();
        doc.moveTo(doc.page.width - 350, signatureLineY).lineTo(doc.page.width - 150, signatureLineY).stroke();

        doc.fontSize(10).text('Course Instructor', 150, signatureLineY + 10, { width: 200, align: 'center' });
        doc.text('LMS Platform Director', doc.page.width - 350, signatureLineY + 10, { width: 200, align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Certificate error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const progress = await CourseProgress.findOne({ user: userId, course: courseId })
            .populate({
                path: 'course',
                select: 'title thumbnail_url instructor_name price status duration_hours content'
            });

        if (progress) {
            const formattedProgress = {
                _id: progress._id,
                userId: progress.user,
                courseId: progress.course._id,
                courseName: progress.course.title,
                thumbnail: progress.course.thumbnail_url,
                instructor: progress.course.instructor_name,
                price: progress.course.price,
                status: progress.status || 'Not Started',
                duration: progress.course.duration_hours,
                completionPercentage: progress.percentage,
                isCompleted: progress.status === 'Completed',
                completedVideos: progress.completedVideos,
                totalVideos: progress.course.content.reduce((sum, section) => sum + section.videos.length, 0),
                lastAccessedAt: progress.lastAccessed,
                completedAt: progress.completedAt,
                startedAt: progress.createdAt
            };
            res.json({ progress: formattedProgress });
        } else {
            res.json({ progress: null });
        }
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await CourseProgress.find({ user: userId })
            .populate({
                path: 'course',
                select: 'title thumbnail_url instructor_name price status duration_hours'
            })
            .sort({ lastAccessed: -1 });

        // Format response with course details and ensure consistent field types
        const formattedProgress = progress.map(p => {
            // Ensure courseId is always a string for frontend matching
            const courseIdValue = p.course?._id ? p.course._id.toString() : p.course.toString();

            return {
                _id: p._id,
                userId: p.user.toString(),
                course: {
                    _id: courseIdValue  // Include course object with _id as string
                },
                courseId: courseIdValue,  // Also include direct courseId field as string
                courseName: p.course?.title || 'Unknown Course',
                thumbnail: p.course?.thumbnail_url || '',
                instructor: p.course?.instructor_name || 'Unknown Instructor',
                price: p.course?.price || 0,
                status: p.status || 'Not Started',
                duration: p.course?.duration_hours || 0,
                completionPercentage: p.percentage || 0,
                isCompleted: p.status === 'Completed',
                completedVideos: p.completedVideos ? p.completedVideos.length : 0,
                lastAccessedAt: p.lastAccessed,
                completedAt: p.completedAt,
                startedAt: p.createdAt
            };
        });

        res.json({ progress: formattedProgress });
    } catch (error) {
        console.error('Get all progress error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
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

        // Track if course was already completed before this update
        const wasCompletedBefore = progress.isCompleted;

        // Add video to completed videos if not already there
        if (videoId && !progress.completedVideos.some(v => v.toString() === videoId.toString())) {
            progress.completedVideos.push(videoId);
        }

        // Recalculate percentage from course content
        const course = await Course.findById(courseId);
        if (course && course.content && course.content.length > 0) {
            let totalVideos = 0;
            course.content.forEach(section => {
                if (section.videos) {
                    totalVideos += section.videos.length;
                }
            });

            if (totalVideos > 0) {
                const completedCount = progress.completedVideos.length;
                const percentage = Math.round((completedCount / totalVideos) * 100);
                progress.percentage = Math.min(100, percentage);

                // Update Status based on completion percentage
                if (percentage >= 100) {
                    progress.isCompleted = true;
                    progress.status = 'Completed';
                    if (!progress.completedAt) {
                        progress.completedAt = new Date();
                    }
                } else if (percentage > 0) {
                    progress.isCompleted = false;
                    progress.status = 'In Progress';
                } else {
                    progress.isCompleted = false;
                    progress.status = 'Not Started';
                }
            }
        }

        progress.lastAccessed = new Date();
        await progress.save();

        // Update Profile: increment coursesCompleted only if course just became completed
        if (!wasCompletedBefore && progress.status === 'Completed') {
            const profile = await Profile.findOne({ user: userId });
            if (profile) {
                profile.coursesCompleted = (profile.coursesCompleted || 0) + 1;
                await profile.save();
                console.log(`Course ${courseId} completed by user ${userId}. Total completed: ${profile.coursesCompleted}`);
            }
        }

        res.json({
            progress,
            message: progress.status === 'Completed' && !wasCompletedBefore ? 'Course completed!' : 'Progress updated'
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
