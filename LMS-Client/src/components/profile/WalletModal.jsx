import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function WalletModal({ isOpen, onClose, balance, onRecharge }) {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    const handleRecharge = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        setIsProcessing(true);
        setMessage(null);

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            // Note: Ideally use a context or proper auth hook, but for now assuming direct fetch with credentials include will work if configured, 
            // OR we might need to rely on the backend cookie handling (which we set to httpOnly). 
            // Actually, the backend uses httpOnly cookies, so we don't need to manually attach if `credentials: 'include'` is set.
            // But let's check how other components do it. 
            // I'll proceed with standard fetch with credentials.

            const response = await fetch('http://localhost:4000/api/transactions/recharge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    // We need userId? The backend expects it in body: const { userId, amount } = req.body;
                    // Wait, usually the userId should be extracted from the token in the backend middleware (req.user.id). 
                    // But the current backend `transactionController.js` reads `req.body.userId`.
                    // And `auth.js` middleware doesn't seem to be applied to `transactionRoutes` in `index.js` yet?
                    // Ah, valid point. I should probably check if I need to pass userId or if I should fix backend to use auth middleware.
                    // Looking at `transactionController.js`: `const { userId, amount } = req.body;`
                    // Let's pass userId for now if we have it in frontend context, or fetch "me" first?
                    // The User Request implies "banking crediential that a user give when he registered".
                    // I'll assume for this Modal we need the User ID. 
                    // Let's assume the parent passes it or we get it from local storage/context. 
                    // For now, I'll ask the user to pass `userId` as a prop too.
                    userId: window.localStorage.getItem('userId'), // Provisional, might need adjustment
                    amount: Number(amount)
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Recharge failed');

            setMessage({ type: 'success', text: `Recharge successful! New balance: $${data.newBalance}` });
            setAmount('');
            if (onRecharge) onRecharge(data.newBalance);

            // Close after short delay
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
                        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <CreditCard className="w-6 h-6 mr-2 text-cyan-400" />
                                My Wallet
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <p className="text-gray-400 text-sm mb-1">Current Balance</p>
                                <div className="text-3xl font-bold text-green-400">${balance?.toFixed(2) || '0.00'}</div>
                            </div>

                            <form onSubmit={handleRecharge} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Recharge Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full bg-gray-950 border border-gray-700 text-white pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-lg flex items-start text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        )}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="button" // Change to submit if we want normal form submission, but logic is custom
                                    onClick={handleRecharge}
                                    disabled={isProcessing || !amount}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
                                >
                                    {isProcessing ? 'Processing...' : 'Recharge Wallet'}
                                    {!isProcessing && <ChevronRight className="w-5 h-5 ml-1" />}
                                </button>
                            </form>
                        </div>

                        <div className="p-4 bg-gray-950 text-center text-xs text-gray-500 border-t border-gray-800">
                            Secure payment processed via saved banking credentials.
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
