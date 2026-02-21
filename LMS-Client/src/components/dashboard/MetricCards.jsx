import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp } from 'lucide-react';

const MetricCards = ({ totalCourses, completedCount, inProgressCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Courses */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 rounded-lg border-l-4 border-cyan-500 shadow-xl shadow-cyan-900/40 p-6 transition hover:shadow-cyan-500/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Courses</span>
                    <BookOpen className="w-6 h-6 text-cyan-500" />
                </div>
                <h2 className="text-5xl font-extrabold text-white mt-2">{totalCourses}</h2>
            </motion.div>

            {/* Completed */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-xl shadow-green-900/40 p-6 transition hover:shadow-green-500/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Completed Courses</span>
                    <Award className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-5xl font-extrabold text-white mt-2">{completedCount}</h2>
            </motion.div>

            {/* In Progress */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-gray-800 rounded-lg border-l-4 border-indigo-500 shadow-xl shadow-indigo-900/40 p-6 transition hover:shadow-indigo-500/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">In Progress</span>
                    <TrendingUp className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-5xl font-extrabold text-white mt-2">{inProgressCount}</h2>
            </motion.div>
        </div>
    );
};

export default MetricCards;
