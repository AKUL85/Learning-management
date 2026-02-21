import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Clock, Search, Zap, Star, MonitorPlay } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const API_BASE = "http://localhost:4000/api/courses";

const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;
    const bgColor = type === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl backdrop-blur-md border shadow-2xl font-medium z-50 flex items-center gap-2 ${bgColor}`}
                    onClick={onClose}
                >
                    <Zap className="w-4 h-4" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function HomePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ message: "", type: "success", isVisible: false });

    const { profile } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, type = "success") => {
        setToast({ message, type, isVisible: true });
        setTimeout(() => setToast({ message: "", type, isVisible: false }), 3000);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_BASE}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to fetch courses");
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (error) {
            showToast("Failed to load courses", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return <LoadingSpinner message="Accessing course marketplace..." showNavbar={true} />;
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden selection:bg-blue-500/30">
            <Navbar />
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                                COURSE MARKETPLACE
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Access a wide range of learning courses. Upskill your knowledge with premium courses from top-rated instructors.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
                            <div className="relative bg-[#0F172A]/90 backdrop-blur-xl rounded-2xl flex items-center border border-gray-700 p-2 shadow-2xl">
                                <Search className="w-6 h-6 text-gray-400 ml-4" />
                                <input
                                    type="text"
                                    placeholder="Search courses by title or instructor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none text-white text-lg px-4 py-2 focus:ring-0 focus:outline-none placeholder-gray-500"
                                />
                                <div className="hidden sm:flex items-center space-x-2 px-4 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono">⌘K</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                        <MonitorPlay className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white tracking-wide">AVAILABLE COURSES</h2>
                    </div>
                    <span className="text-sm font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                        {filteredCourses.length} COURSES FOUND
                    </span>
                </div>

                {filteredCourses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-900/30 backdrop-blur-md rounded-3xl border border-gray-800/50"
                    >
                        <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl text-gray-400 font-medium">No filtered results</h3>
                        <p className="text-gray-600 mt-2">Try adjusting your search query.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredCourses.map(course => (
                            <motion.div
                                key={course._id}
                                variants={item}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                                onClick={() => navigate(`/course/${course._id}`)}
                            >
                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:via-blue-600/10 transition-all duration-500" />

                                {/* Thumbnail */}
                                <div className="h-52 relative overflow-hidden bg-gray-800">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <BookOpen className="w-16 h-16 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                                        <span className="text-white font-bold text-sm tracking-wide">${course.price}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-6 relative">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="flex items-center text-gray-400 text-sm mb-4 space-x-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1.5 text-blue-500" />
                                            <span>{course.instructor_name || 'System'}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <div className="flex items-center text-gray-500 text-xs font-mono uppercase">
                                            <Clock className="w-3 h-3 mr-1" />
                                            <span>Self-paced</span>
                                        </div>
                                        <div className="flex items-center text-blue-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                                            VIEW COURSE <Zap className="w-3 h-3 ml-1 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
