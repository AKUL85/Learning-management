// src/components/course-detail/PurchaseModal.jsx
import { motion } from 'framer-motion';
import { CreditCard, Key } from 'lucide-react';

export default function PurchaseModal({ course, profile, bankAccount, setBankAccount, bankSecret, setBankSecret, onConfirm, onClose, purchasing }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-cyan-700 shadow-3xl max-w-md w-full p-8"
      >
        <h3 className="text-3xl font-bold text-cyan-400 mb-6">Complete Purchase</h3>

        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex justify-between border-b border-gray-700 pb-2 mb-3">
            <span className="text-gray-400">Course</span>
            <span className="text-white font-medium truncate">{course.title}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-400">Price</span>
            <span className="text-green-400 font-extrabold text-xl">${course.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400">Balance</span>
            <span className="text-white">${(profile?.bank_balance ?? 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <CreditCard className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-gray-600 text-white focus:border-cyan-400 outline-none"
              placeholder="Account ID" />
          </div>
          <div className="relative">
            <Key className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="password" value={bankSecret} onChange={e => setBankSecret(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-gray-600 text-white focus:border-cyan-400 outline-none"
              placeholder="Security Key" />
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg">
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onConfirm} disabled={purchasing}
            className="flex-1 bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold disabled:opacity-50">
            {purchasing ? 'Processing...' : 'Complete Purchase'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}