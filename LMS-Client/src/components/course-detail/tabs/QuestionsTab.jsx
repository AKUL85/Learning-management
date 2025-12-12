// src/components/course-detail/tabs/QuestionsTab.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, CheckCircle, Search, Filter, User, Clock, ChevronDown } from 'lucide-react';

const QuestionItem = ({ question, isEnrolled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpful, setHelpful] = useState(question.helpful || 0);
  const [voted, setVoted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-cyan-600/50 transition-all"
    >
      <div
        className="p-6 cursor-pointer flex items-start justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {question.author.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center">
                {question.author}
                {question.isInstructor && (
                  <span className="ml-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded-full">INSTRUCTOR</span>
                )}
              </h4>
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(question.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">{question.title}</h3>
          {isExpanded && (
            <p className="text-gray-300 leading-relaxed">{question.body}</p>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Answer */}
      {question.answer && (
        <div className="px-6 pb-6 border-t border-gray-700 bg-gray-900/30">
          <div className="mt-5 flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-400 font-medium mb-2">Instructor Answer</p>
              <p className="text-gray-200 leading-relaxed">{question.answer}</p>
              <div className="mt-4 flex items-center space-x-6 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!voted) {
                      setHelpful(helpful + 1);
                      setVoted(true);
                    }
                  }}
                  className={`flex items-center space-x-2 transition ${voted ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'}`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Helpful ({helpful})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Answer Yet */}
      {!question.answer && isEnrolled && (
        <div className="px-6 pb-5 text-sm text-gray-500 italic">
          Instructor will respond soon...
        </div>
      )}
    </motion.div>
  );
};

export default function QuestionsTab({ mcqs = [], cqs = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unanswered, instructor
  const isEnrolled = true; // Replace with real check

  // Mock Q&A data
  const questions = [
    {
      id: 1,
      author: "Raj Patel",
      title: "How to fix 'Access Denied' on S3 bucket?",
      body: "I'm following the lecture on S3 permissions but keep getting Access Denied even after attaching the policy. Any ideas?",
      date: "2025-04-08",
      helpful: 24,
      answer: "Great question! This usually happens when the bucket policy overrides IAM. Check if there's a Deny statement in the bucket policy. Also, make sure the IAM role has s3:PutObject and the bucket isn't set to Block Public Access incorrectly. I'll share a working policy template in the next update!",
      isInstructor: true
    },
    {
      id: 2,
      author: "Emma Wilson",
      title: "Best way to debug Lambda timeout issues?",
      body: "My Lambda keeps timing out at 3 seconds even though I set it to 30s. Any debugging tips?",
      date: "2025-04-07",
      helpful: 18,
      answer: null
    },
    {
      id: 3,
      author: "Carlos M.",
      title: "Can we use Terraform with Azure too?",
      body: "The course focuses on AWS, but will the same Terraform concepts apply to Azure and GCP?",
      date: "2025-04-05",
      helpful: 42,
      answer: "Absolutely! 95% of the Terraform concepts are provider-agnostic. Only resource syntax changes. I’ll add a bonus module on multi-cloud Terraform soon!",
      isInstructor: true
    }
  ];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.body?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'unanswered') return !q.answer;
    if (filter === 'instructor') return q.isInstructor;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-cyan-400" />
          Q&A - Student Questions
        </h3>
        <p className="text-gray-400">
          {questions.length} questions • {questions.filter(q => q.answer).length} answered
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-5 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none transition"
        >
          <option value="all">All Questions</option>
          <option value="unanswered">Unanswered</option>
          <option value="instructor">Instructor Answers</option>
        </select>
      </div>

      {/* Ask Question CTA */}
      {isEnrolled && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 transition"
        >
          <MessageSquare className="w-6 h-6" />
          <span>Ask a Question</span>
        </motion.button>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, i) => (
            <QuestionItem key={q.id} question={q} isEnrolled={isEnrolled} />
          ))
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No questions match your filter</p>
          </div>
        )}
      </div>

      {/* Not Enrolled State */}
      {!isEnrolled && (
        <div className="mt-12 p-8 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 text-center">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-4">
            Enroll to ask questions and join the discussion
          </p>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition">
            Enroll Now
          </button>
        </div>
      )}
    </div>
  );
}