import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components locally if needed, though usually done at app root or parent.
// Since the parent did it, we might not strictly need it here if the instance is shared,
// but it's safe to re-register or assume registration.
// To be safe and self-contained:
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressCharts = ({ pieData, barData, chartOptions }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
        >
            {/* Enrollment Distribution Pie Chart */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b border-gray-700 pb-2">STATUS DISTRIBUTION</h3>
                <div className="h-64 flex items-center justify-center">
                    <Pie data={pieData} options={chartOptions} />
                </div>
            </div>

            {/* Progress Bar Chart */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b border-gray-700 pb-2">INDIVIDUAL PROGRESS MAPPING</h3>
                <div className="h-64 flex items-center justify-center">
                    <Bar data={barData} options={chartOptions} />
                </div>
            </div>
        </motion.div>
    );
};

export default ProgressCharts;
