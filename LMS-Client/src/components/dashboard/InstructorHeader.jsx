import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const InstructorHeader = ({ onOpenCreateModal }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4"
        >
            <div>
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">INSTRUCTOR CONSOLE</h1>
                <p className="text-gray-500 font-light">Management interface for protocol deployment and revenue tracking.</p>
            </div>
            <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCreateModal}
                className="bg-cyan-500 text-gray-900 px-6 py-3 rounded-xl font-bold uppercase shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-colors flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
            </motion.button>
        </motion.div>
    );
};

export default InstructorHeader;
