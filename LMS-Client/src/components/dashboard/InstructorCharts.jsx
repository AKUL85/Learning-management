import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const InstructorCharts = ({ earningsData, transactionData, chartOptions }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <motion.div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">COURSE PRICING STRUCTURE</h2>
                {earningsData.labels.length > 0 ? (
                    <div className="h-72"><Bar data={earningsData} options={chartOptions} /></div>
                ) : (
                    <p className="text-gray-600 text-center py-8">No pricing data available.</p>
                )}
            </motion.div>

            <motion.div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">REVENUE SOURCE BREAKDOWN</h2>
                <div className="h-72"><Bar data={transactionData} options={chartOptions} /></div>
            </motion.div>
        </div>
    );
};

export default InstructorCharts;
