import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';

export default function QuestionsTab({ mcqs = [], cqs = [] }) {
  const [activeTab, setActiveTab] = useState('mcq');

  return (
    <div className="space-y-8">
      {/* Toggle between MCQs and CQs */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('mcq')}
          className={`pb-2 px-4 transition-colors relative ${activeTab === 'mcq' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Multiple Choice Questions ({mcqs.length})
          {activeTab === 'mcq' && <motion.div layoutId="qtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
        <button
          onClick={() => setActiveTab('cq')}
          className={`pb-2 px-4 transition-colors relative ${activeTab === 'cq' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Conceptual Questions ({cqs.length})
          {activeTab === 'cq' && <motion.div layoutId="qtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mcq' && (
          <motion.div
            key="mcq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {mcqs.length > 0 ? mcqs.map((mcq, i) => (
              <MCQItem key={i} mcq={mcq} index={i} />
            )) : (
              <p className="text-gray-400 italic">No multiple choice questions available.</p>
            )}
          </motion.div>
        )}

        {activeTab === 'cq' && (
          <motion.div
            key="cq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {cqs.length > 0 ? cqs.map((cq, i) => (
              <CQItem key={i} cq={cq} index={i} />
            )) : (
              <p className="text-gray-400 italic">No conceptual questions available.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MCQItem({ mcq, index }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const isCorrect = selectedOption === mcq.correct_option;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h4 className="text-lg font-bold text-white mb-4 flex items-start">
        <span className="text-cyan-500 mr-2">Q{index + 1}.</span>
        {mcq.question}
      </h4>
      <div className="space-y-2">
        {mcq.options.map((option, optIndex) => (
          <button
            key={optIndex}
            onClick={() => setSelectedOption(optIndex)}
            disabled={selectedOption !== null}
            className={`w-full text-left p-3 rounded-lg border transition flex justify-between items-center ${selectedOption === null
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-300'
                : selectedOption === optIndex
                  ? isCorrect
                    ? 'bg-green-900/30 border-green-500 text-green-300'
                    : 'bg-red-900/30 border-red-500 text-red-300'
                  : mcq.correct_option === optIndex
                    ? 'bg-green-900/30 border-green-500 text-green-300'
                    : 'bg-gray-800 border-gray-700 text-gray-500 opacity-50'
              }`}
          >
            <span>{option}</span>
            {selectedOption !== null && mcq.correct_option === optIndex && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            {selectedOption === optIndex && !isCorrect && (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function CQItem({ cq, index }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h4 className="text-lg font-bold text-white mb-4 flex items-start">
        <span className="text-purple-500 mr-2">Q{index + 1}.</span>
        {cq.question}
      </h4>

      {showAnswer ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900/50 p-4 rounded-lg border-l-4 border-cyan-500 text-gray-300"
        >
          <p className="font-semibold text-cyan-400 mb-1">Answer:</p>
          {cq.answer}
        </motion.div>
      ) : (
        <button
          onClick={() => setShowAnswer(true)}
          className="text-cyan-400 text-sm font-bold hover:underline flex items-center"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Show Answer
        </button>
      )}
    </div>
  );
}