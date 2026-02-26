import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Receipt, ChevronDown, ChevronUp, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

const typeLabels = {
  course_purchase: 'Course Purchase',
  course_upload_reward: 'Upload Reward',
  wallet_recharge: 'Wallet Recharge',
  payout: 'Payout',
};

const typeIcons = {
  course_purchase: ArrowUpRight,
  course_upload_reward: ArrowDownLeft,
  wallet_recharge: ArrowDownLeft,
  payout: ArrowUpRight,
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const TransactionHistory = ({ transactions = [], role = 'learner' }) => {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCount, setShowCount] = useState(10);

  if (transactions.length === 0) return null;

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const visibleTransactions = filteredTransactions.slice(0, showCount);

  const filterOptions = role === 'instructor'
    ? [
      { value: 'all', label: 'All' },
      { value: 'course_purchase', label: 'Purchases' },
      { value: 'course_upload_reward', label: 'Rewards' },
      { value: 'wallet_recharge', label: 'Recharges' },
    ]
    : [
      { value: 'all', label: 'All' },
      { value: 'course_purchase', label: 'Purchases' },
      { value: 'wallet_recharge', label: 'Recharges' },
    ];

  const isCredit = (type) => {
    if (role === 'instructor') {
      return ['course_upload_reward', 'course_purchase', 'wallet_recharge'].includes(type);
    }
    return ['wallet_recharge'].includes(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-10 border border-gray-700"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-2xl font-bold text-blue-400 flex items-center">
          <Receipt className="w-6 h-6 mr-2" />
          TRANSACTION HISTORY
          <span className="ml-3 text-sm font-normal text-gray-500">({transactions.length})</span>
        </h2>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              <Filter className="w-4 h-4 text-gray-500 mt-1.5" />
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); setFilter(opt.value); setShowCount(10); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
              {visibleTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-6 italic">No transactions found for this filter.</p>
              ) : (
                visibleTransactions.map((tx, index) => {
                  const TypeIcon = typeIcons[tx.type] || ArrowUpRight;
                  const statusCfg = statusConfig[tx.status] || statusConfig.pending;
                  const StatusIcon = statusCfg.icon;
                  const credit = isCredit(tx.type);
                  const courseName = tx.course_id?.title || null;

                  return (
                    <motion.div
                      key={tx._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900/60 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors gap-3"
                    >
                      {/* Left: Icon + Details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${credit ? 'bg-green-500/10' : 'bg-red-500/10'} shrink-0`}>
                          <TypeIcon className={`w-5 h-5 ${credit ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm">
                            {typeLabels[tx.type] || tx.type}
                          </p>
                          {courseName && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{courseName}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount + Status */}
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`text-lg font-bold font-mono ${credit ? 'text-green-400' : 'text-red-400'}`}>
                          {credit ? '+' : '-'}${tx.amount?.toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Show More */}
            {filteredTransactions.length > showCount && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowCount(prev => prev + 10); }}
                className="mt-4 w-full py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Show more ({filteredTransactions.length - showCount} remaining)
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TransactionHistory;
