const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Profile = require('../models/Profile');
const PDFDocument = require('pdfkit');

exports.getCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const progress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!progress || !progress.isCompleted) {
            return res.status(403).json({ message: 'Course not completed yet. Complete all videos to earn your certificate.' });
        }

        const course = await Course.findById(courseId);
        const profile = await Profile.findOne({ user: userId });

        if (!course || !profile) {
            return res.status(404).json({ message: 'Course or Profile not found' });
        }

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${courseId}.pdf`);

        doc.pipe(res);

        const pageW = doc.page.width;
        const pageH = doc.page.height;

        // Background
        doc.rect(0, 0, pageW, pageH).fill('#fdfcfb');

        // Decorative outer border
        doc.rect(20, 20, pageW - 40, pageH - 40).lineWidth(3).stroke('#0e7490');
        doc.rect(26, 26, pageW - 52, pageH - 52).lineWidth(1).stroke('#22d3ee');

        // Corner accents (top-left, top-right, bottom-left, bottom-right)
        const cornerSize = 40;
        const drawCorner = (x, y, dx, dy) => {
            doc.moveTo(x, y).lineTo(x + dx * cornerSize, y).lineWidth(3).stroke('#0e7490');
            doc.moveTo(x, y).lineTo(x, y + dy * cornerSize).lineWidth(3).stroke('#0e7490');
        };
        drawCorner(35, 35, 1, 1);
        drawCorner(pageW - 35, 35, -1, 1);
        drawCorner(35, pageH - 35, 1, -1);
        drawCorner(pageW - 35, pageH - 35, -1, -1);

        // Top decorative line
        doc.moveTo(pageW / 2 - 120, 60).lineTo(pageW / 2 + 120, 60).lineWidth(2).stroke('#0e7490');

        // Platform branding
        doc.fontSize(11).fillColor('#64748b').text('LMS Learning Platform', 0, 72, { align: 'center', width: pageW });

        // Main title
        doc.fontSize(44).fillColor('#0e7490').text('CERTIFICATE', 0, 100, { align: 'center', width: pageW, characterSpacing: 8 });
        doc.fontSize(18).fillColor('#475569').text('OF COMPLETION', 0, 155, { align: 'center', width: pageW, characterSpacing: 4 });

        // Divider
        doc.moveTo(pageW / 2 - 80, 185).lineTo(pageW / 2 + 80, 185).lineWidth(1.5).stroke('#22d3ee');

        // Body text
        doc.fontSize(13).fillColor('#64748b').text('This is to certify that', 0, 205, { align: 'center', width: pageW });

        // Student name with underline accent
        const nameY = 235;
        doc.fontSize(32).fillColor('#0f172a').text(profile.fullName, 0, nameY, { align: 'center', width: pageW });
        const nameWidth = doc.widthOfString(profile.fullName);
        const nameX = (pageW - nameWidth) / 2;
        doc.moveTo(nameX, nameY + 40).lineTo(nameX + nameWidth, nameY + 40).lineWidth(1).stroke('#0e7490');

        // Course completion text
        doc.fontSize(13).fillColor('#64748b').text('has successfully completed the course', 0, 290, { align: 'center', width: pageW });

        // Course title
        doc.fontSize(24).fillColor('#0e7490').text(`"${course.title}"`, 60, 318, { align: 'center', width: pageW - 120 });

        // Instructor info
        const instructorName = course.instructor_name || 'Instructor';
        doc.fontSize(12).fillColor('#64748b').text(`Taught by ${instructorName}`, 0, 360, { align: 'center', width: pageW });

        // Completion date and certificate ID
        const completionDate = progress.completedAt
            ? new Date(progress.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        doc.fontSize(10).fillColor('#94a3b8').text(`Completed on ${completionDate}`, 0, 390, { align: 'center', width: pageW });
        doc.fontSize(9).fillColor('#cbd5e1').text(`Certificate ID: ${progress._id}`, 0, 408, { align: 'center', width: pageW });

        // Signature lines
        const sigY = 450;
        const leftSigX = pageW / 2 - 230;
        const rightSigX = pageW / 2 + 30;
        const sigWidth = 200;

        doc.moveTo(leftSigX, sigY).lineTo(leftSigX + sigWidth, sigY).lineWidth(1).stroke('#94a3b8');
        doc.moveTo(rightSigX, sigY).lineTo(rightSigX + sigWidth, sigY).lineWidth(1).stroke('#94a3b8');

        doc.fontSize(10).fillColor('#64748b');
        doc.text(instructorName, leftSigX, sigY + 8, { width: sigWidth, align: 'center' });
        doc.fontSize(9).fillColor('#94a3b8').text('Course Instructor', leftSigX, sigY + 22, { width: sigWidth, align: 'center' });

        doc.fontSize(10).fillColor('#64748b');
        doc.text('LMS Platform', rightSigX, sigY + 8, { width: sigWidth, align: 'center' });
        doc.fontSize(9).fillColor('#94a3b8').text('Platform Director', rightSigX, sigY + 22, { width: sigWidth, align: 'center' });

        // Bottom decorative line
        doc.moveTo(pageW / 2 - 120, pageH - 55).lineTo(pageW / 2 + 120, pageH - 55).lineWidth(2).stroke('#0e7490');

        doc.end();

    } catch (error) {
        console.error('Certificate error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate certificate' });
        }
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
