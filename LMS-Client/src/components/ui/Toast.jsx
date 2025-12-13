import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    let bgColor = 'bg-green-700/80';
    let icon = <CheckCircle className="w-5 h-5 mr-2" />;
    if (type === 'error') {
        bgColor = 'bg-red-700/80';
        icon = <Zap className="w-5 h-5 mr-2" />;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    // Glassmorphism and Neon Style
                    className={`fixed top-4 right-4 p-4 rounded-xl backdrop-blur-md border border-gray-600 shadow-2xl text-white font-semibold z-50 cursor-pointer ${bgColor} flex items-center`}
                    onClick={onClose}
                >
                    {icon}
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
