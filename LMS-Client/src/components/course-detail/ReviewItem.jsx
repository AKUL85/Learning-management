// src/components/course-detail/ReviewItem.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';

export default function ReviewItem({ review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-700/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {review.author.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-white flex items-center">
              {review.author}
              {review.verified && <CheckCircle className="w-4 h-4 text-green-400 ml-2" />}
            </h4>
            <p className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
          ))}
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-6">{review.comment}</p>

      <div className="flex items-center space-x-6 text-sm">
        <button
          onClick={() => !voted && (setHelpful(helpful + 1), setVoted(true))}
          className={`flex items-center space-x-2 transition ${voted ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'}`}
        >
          <ThumbsUp className="w-5 h-5" />
          <span>Helpful ({helpful})</span>
        </button>
      </div>
    </motion.div>
  );
}