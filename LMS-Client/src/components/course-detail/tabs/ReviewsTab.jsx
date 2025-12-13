// src/components/course-detail/tabs/ReviewsTab.jsx
import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, AlertCircle } from 'lucide-react';
import ReviewItem from '../ReviewItem';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function ReviewsTab({ courseId, reviews: initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // If initialReviews changes (e.g. parent refetch), update state
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const handleSubmit = async () => {
    if (!newReview.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Assuming token storage
        body: JSON.stringify(newReview)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit review');
      }

      const updatedCourse = await res.json();
      setReviews(updatedCourse.reviews);
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const totalReviews = reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star =>
    reviews.filter(r => r.rating === star).length
  );

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-6xl font-extrabold text-cyan-400">{averageRating}</div>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-8 h-8 ${i < Math.round(Number(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
            ))}
          </div>
          <p className="text-gray-400 mt-2">Based on {totalReviews} reviews</p>
        </div>

        <div className="md:col-span-2 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 w-3">{star}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalReviews ? (ratingDistribution[5 - star] / totalReviews) * 100 : 0}%` }} // Adjusted index
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                />
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">{reviews.filter(r => r.rating === star).length}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Student Reviews</h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h4 className="text-xl font-bold text-white mb-4">Share Your Experience</h4>
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                />
              </button>
            ))}
            <span className="ml-4 text-lg text-gray-300">{newReview.rating} Star{newReview.rating > 1 ? 's' : ''}</span>
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            placeholder="Tell us about your experience with this course..."
            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-8 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? reviews.map((review, i) => (
          <ReviewItem key={review._id || i} review={review} />
        )) : (
          <p className="text-gray-400 italic">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}