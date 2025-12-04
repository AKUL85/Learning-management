import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, DollarSign, Clock, Target, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

// 🔧 CHANGE THIS depending on your backend URL
const API_BASE = "http://localhost:4000/api/courses";

// --- Toast Component ---
const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    const bgColor = type === "error" ? "bg-red-700/80" : "bg-green-700/80";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed top-4 right-4 p-4 rounded-xl backdrop-blur-md border border-gray-600 
                               shadow-2xl text-white font-semibold z-50 cursor-pointer ${bgColor} flex items-center`}
                    onClick={onClose}
                >
                    <Zap className="w-5 h-5 mr-2" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function HomePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // 🔥 **REAL API FETCH**
    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_BASE}`, {
                method: "GET",
                credentials: "include", // to include cookies if using JWT cookies
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await res.json();
            setCourses(data.courses || []); // expecting: { courses: [...] }
        } catch (error) {
            showToast("Failed to load courses", "error");
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="mt-4 text-gray-400">Loading protocol data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />

            {/* HERO */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-b border-cyan-800 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                            KNOWLEDGE.GRID ACCESS
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">Acquire the latest training modules for system expansion.</p>

                        {profile && (
                            <div className="inline-block bg-cyan-900/40 backdrop-blur-lg rounded-full border border-cyan-700 px-6 py-3 shadow-lg">
                                <p className="text-lg font-mono">
                                    AGENT: <span className="font-semibold text-cyan-300">{profile.full_name}</span>
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
                    <h2 className="text-3xl font-bold text-cyan-400">AVAILABLE PROTOCOLS</h2>
                    <span className="text-gray-500 font-mono">{courses.length} modules indexed</span>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
                        <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl text-white mb-2">No active modules found</h3>
                        <p className="text-gray-500">Awaiting new data deployment...</p>
                    </div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {courses.map(course => (
                            <motion.div
                                key={course._id}
                                variants={item}
                                whileHover={{ y: -8, boxShadow: "0 10px 30px rgba(6,182,212,0.4)" }}
                                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-xl overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/course/${course._id}`)}
                            >

                                {/* Thumbnail */}
                                <div className="h-48 bg-gradient-to-br from-indigo-900 to-gray-900 relative border-b border-cyan-700/50">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BookOpen className="w-20 h-20 text-indigo-400/20" />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-cyan-500/90 px-4 py-2 rounded-full shadow-lg">
                                        <span className="text-gray-900 font-extrabold text-lg">${course.price}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>

                                    <div className="flex items-center text-gray-400 mb-3">
                                        <User className="w-4 h-4 mr-2 text-indigo-400" />
                                        <span className="text-sm font-medium">Agent: {course.instructor_name}</span>
                                    </div>

                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                        <div className="flex items-center text-cyan-500 text-sm font-mono">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span>ASYNC ACCESS</span>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-cyan-600 text-gray-900 px-6 py-2 rounded-lg font-bold shadow-cyan-600/50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/course/${course._id}`);
                                            }}
                                        >
                                            Access Module
                                        </motion.button>
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
