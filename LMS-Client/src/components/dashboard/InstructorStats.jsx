import { motion } from 'framer-motion';
import { Code, DollarSign, Clock, Users } from 'lucide-react';

const InstructorStats = ({ totalCourses, totalEarnings, pendingTransactionsCount, totalAudience }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <motion.div className="bg-gray-800 rounded-xl border-l-4 border-cyan-500 shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 mb-1 uppercase text-sm"> Total Courses</p>
                        <p className="text-4xl font-extrabold text-white font-mono">{totalCourses}</p>
                    </div>
                    <Code className="w-8 h-8 text-cyan-500" />
                </div>
            </motion.div>

            <motion.div className="bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 mb-1 uppercase text-sm">Total Revenue</p>
                        <p className="text-4xl font-extrabold text-green-400 font-mono">${totalEarnings.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                </div>
            </motion.div>

            <motion.div className="bg-gray-800 rounded-xl border-l-4 border-yellow-500 shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 mb-1 uppercase text-sm">Pending Validation</p>
                        <p className="text-4xl font-extrabold text-yellow-400 font-mono">{pendingTransactionsCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                </div>
            </motion.div>

            <motion.div className="bg-gray-800 rounded-xl border-l-4 border-indigo-500 shadow-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 mb-1 uppercase text-sm">Total Audience</p>
                        <p className="text-4xl font-extrabold text-white font-mono">{totalAudience}</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-500" />
                </div>
            </motion.div>
        </div>
    );
};

export default InstructorStats;
