import { motion } from 'framer-motion';
import { Gauge, CheckCircle } from 'lucide-react';

const PendingTransactions = ({ transactions, onValidate }) => {
    return (
        <motion.div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-10 border border-yellow-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center"><Gauge className="w-6 h-6 mr-2" /> PENDING TRANSACTION QUEUE</h2>
            <div className="space-y-4">
                {transactions.map((transaction) => (
                    <motion.div key={transaction._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-yellow-600/50 bg-gray-900 rounded-xl hover:bg-gray-700 transition">
                        <div className="flex-1 mb-2 sm:mb-0">
                            <p className="font-semibold text-white font-mono">Course Pending - <span className='text-green-400'>+${transaction.amount.toFixed(2)}</span></p>
                            <p className="text-sm text-gray-500">ID: {transaction._id} | Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                        <motion.button onClick={() => onValidate(transaction)} className="bg-green-600 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors flex items-center shadow-md">
                            <CheckCircle className="w-4 h-4 mr-2" /> VALIDATE
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default PendingTransactions;
