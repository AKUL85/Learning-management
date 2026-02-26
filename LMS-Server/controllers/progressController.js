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

        if (!progress.completedVideos.some(v => v.toString() === videoId)) {
            progress.completedVideos.push(videoId);
        }

        const course = await Course.findById(courseId);
        if (course) {
            let totalVideos = 0;
            course.content.forEach(section => {
                totalVideos += section.videos.length;
            });

            if (totalVideos > 0) {
                const percentage = Math.round((progress.completedVideos.length / totalVideos) * 100);
                progress.percentage = percentage;

                if (percentage >= 100) {
                    progress.isCompleted = true;
                    if (!progress.completedAt) progress.completedAt = new Date();
                } else {
                    progress.isCompleted = false;
                }
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
