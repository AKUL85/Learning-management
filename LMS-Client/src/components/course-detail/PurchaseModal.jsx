// src/components/course-detail/PurchaseModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle } from 'lucide-react';

export default function PurchaseModal({ course, profile, onConfirm, onClose, purchasing, onRecharge }) {
  const balance = profile?.bankBalance || profile?.bank_balance || 0;
  const sufficientFunds = balance >= course.price;
  const [secretKey, setSecretKey] = useState(''); // Add state

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
        <h3 className="text-3xl font-bold text-cyan-400 mb-6">Confirm Purchase</h3>

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
            <span className="text-gray-400">Wallet Balance</span>
            <span className={`font-bold ${sufficientFunds ? 'text-white' : 'text-red-400'}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {sufficientFunds && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Bank Secret Key
            </label>
            <input
              type="password"
              placeholder="Enter your bank secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Required for transaction verification</p>
          </div>
        )}

        {!sufficientFunds && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">
              Insufficient funds. Please recharge your wallet to continue.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose} className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg">
            Cancel
          </motion.button>

          {sufficientFunds ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onConfirm(secretKey)}
              disabled={purchasing || !secretKey}
              className="flex-1 bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold disabled:opacity-50">
              {purchasing ? 'Processing...' : 'Confirm Payment'}
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onRecharge}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500">
              Recharge Wallet
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}