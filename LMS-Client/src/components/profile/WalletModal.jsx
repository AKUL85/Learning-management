import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function WalletModal({ isOpen, onClose, balance, onRecharge, userId }) {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState(null);

    const handleRecharge = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        setIsProcessing(true);
        setMessage(null);

        try {
            // Use configured API base URL if available in environment, or default to localhost
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

            const response = await fetch(`${API_BASE}/api/transactions/recharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: userId, // Use the prop passed from ProfilePage
                    amount: Number(amount)
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Recharge failed');

            setMessage({ type: 'success', text: `Success! New balance: $${data.newBalance.toFixed(2)}` });
            setAmount('');
            if (onRecharge) onRecharge(data.newBalance);

            setTimeout(() => {
                onClose();
                setMessage(null);
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-cyan-400" />
                                Top Up Wallet
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-1">Current Balance</p>
                                <div className="text-4xl font-bold text-green-400">${balance?.toFixed(2) || '0.00'}</div>
                            </div>

                            <form onSubmit={handleRecharge} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Amount to Add
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-950 border border-gray-700 text-white pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition text-lg"
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg flex items-center text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                                    >
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                        )}
                                        {message.text}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing || !amount}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
                                >
                                    {isProcessing ? 'Processing...' : 'Add Funds'}
                                    {!isProcessing && <ChevronRight className="w-5 h-5 ml-1" />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
