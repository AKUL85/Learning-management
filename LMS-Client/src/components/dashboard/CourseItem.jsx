import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, ChevronDown, ChevronUp, Download, Play, FileText, CheckCircle, Headphones, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getContentIcon = (type) => {
    const defaultClasses = "w-5 h-5 mr-2";
    switch (type) {
        case 'video': return <Play className={`${defaultClasses} text-red-500`} />;
        case 'audio': return <Headphones className={`${defaultClasses} text-yellow-500`} />;
        case 'text': return <FileText className={`${defaultClasses} text-cyan-400`} />; // Cyan for documentation
        case 'mcq': return <CheckCircle className={`${defaultClasses} text-green-500`} />;
        default: return <FileText className={`${defaultClasses} text-gray-500`} />;
    }
};

const CourseItem = ({ enrollment, isExpanded, onToggle, materials }) => {
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);

    const handleDownloadCertificate = async () => {
        if (!enrollment.certificate_url) return;
        setDownloading(true);
        try {
            const response = await fetch(enrollment.certificate_url, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to download certificate');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${enrollment.course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error('Certificate download error:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5 hover:bg-gray-700/60 transition"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-3 md:mb-0 md:w-3/5">
                    <h3
                        className="text-xl font-bold text-cyan-400 cursor-pointer hover:underline"
                        onClick={() => navigate(`/course/${enrollment.course_id}`)}
                    >
                        <Code className="inline w-5 h-5 mr-2 text-cyan-500" />
                        {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-400 ml-7">{enrollment.course.description}</p>
                    <span className="text-xs text-gray-500 mt-1 block ml-7">
                        Instructor: {enrollment.course.instructor_name}
                    </span>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Status Tag */}
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${enrollment.is_completed ? 'bg-green-600/30 text-green-300 border border-green-700 shadow-lg shadow-green-900/50' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-700 shadow-lg shadow-indigo-900/50'}`}>
                        {enrollment.is_completed ? 'COURSE COMPLETED' : 'IN PROGRESS'}
                    </span>

                    {/* View Materials Button (Toggle) */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center px-3 py-1.5 text-sm font-medium border rounded-lg transition ${isExpanded ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                        onClick={onToggle}
                    >
                        {isExpanded ? "Hide Content" : "View Content"}
                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </motion.button>

                    {/* Complete Button / Certificate Button */}
                    {!enrollment.is_completed ? (
                        /* <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-green-600 text-white px-3 py-1.5 text-sm font-medium rounded-lg border border-green-700 shadow-md hover:bg-green-700 transition"
                          onClick={() => completeCourse(enrollment.id)}
                        >
                          <Clock className="w-4 h-4 mr-1 inline" /> Execute Completion
                        </motion.button> */
                        null
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadCertificate}
                            disabled={downloading}
                            className="bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium rounded-lg flex items-center border border-indigo-700 shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {downloading ? <Loader2 className="mr-1 w-4 h-4 animate-spin" /> : <Download className="mr-1 w-4 h-4" />}
                            {downloading ? 'Downloading...' : 'Download Certificate'}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* MATERIALS DROPDOWN */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                >
                    <h4 className="font-semibold mb-3 text-cyan-400">Course Content ({materials?.length || 0} items)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {materials && materials.length > 0 ? materials.map((m) => (
                            <div key={m.id} className="flex items-center p-3 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-600 transition cursor-pointer">
                                {getContentIcon(m.content_type)}
                                <p className="truncate font-mono">{m.title}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">No content available in this course.</p>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CourseItem;
