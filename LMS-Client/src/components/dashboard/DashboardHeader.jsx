import { motion } from 'framer-motion';

const DashboardHeader = () => {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold text-white tracking-wide">
                STUDENT DASHBOARD
            </h1>
            <p className="text-gray-500 font-light mt-1 mb-6">
                Overview of your enrolled courses and progress.
            </p>
        </motion.div>
    );
};

export default DashboardHeader;
