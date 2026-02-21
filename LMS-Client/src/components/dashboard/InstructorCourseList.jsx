import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Eye, FileEdit, Trash, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstructorCourseList = ({ courses, onOpenCreateModal, onDelete }) => {
    const navigate = useNavigate();

    return (
        <motion.div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">MY COURSES</h2>
            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You have not created any courses yet.</p>
                    <motion.button onClick={onOpenCreateModal} className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-700 transition inline-flex items-center shadow-lg">
                        <Plus className="w-5 h-5 mr-2" /> Create Your First Course
                    </motion.button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <motion.div key={course._id} className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-cyan-900/40 transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 mr-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-cyan-400 mb-1">{course.title}</h3>
                                        <div className="flex items-center space-x-1">

                                            {/* View */}
                                            <button
                                                onClick={() => navigate(`/course/${course._id}`)}
                                                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-green-400"
                                                title="View Course Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {/* Edit */}
                                            <button
                                                onClick={() => navigate(`/instructor/course/${course._id}/edit`)}
                                                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-cyan-400"
                                                title="Edit Course"
                                            >
                                                <FileEdit className="w-4 h-4" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => onDelete(course._id)}
                                                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-red-500"
                                                title="Delete Course"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>

                                        </div>
                                    </div>
                                </div>
                                <span className="bg-green-800/50 text-green-300 px-3 py-1 rounded-full text-sm font-mono border border-green-700">${course.price.toFixed(2)}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                            <div className="flex items-center text-gray-600 text-sm">
                                <TrendingUp className="w-4 h-4 mr-2 text-indigo-400" />
                                <span className='text-white'>STATUS: <span className='text-green-500'>LIVE</span></span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default InstructorCourseList;
