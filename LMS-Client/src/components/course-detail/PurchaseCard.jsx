// src/components/course-detail/PurchaseCard.jsx
import { motion } from 'framer-motion';
import LoadingSpinner from "../ui/LoadingSpinner";

import { ShoppingCart, CheckCircle, Lock, Video, FileText, Globe, Award, MessageSquare, Bookmark, Share2, Play, Edit } from 'lucide-react';

export default function PurchaseCard({ course, isEnrolled, onPurchase, onGoToCourse, profile, onPreview, onEdit }) {

  if (!course) {
    return (
      <div>
        <LoadingSpinner></LoadingSpinner>
      </div>
    )
  }
  return (
    <div className="sticky top-24">
      {course.thumbnail_url && (
        <div className="mb-6 relative rounded-xl overflow-hidden cursor-pointer" onClick={onPreview}>
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center space-x-2 hover:bg-gray-100">
              <Play className="w-5 h-5" /><span>Access this course</span>
            </button>
          </div>
        </div>
      )}

      <motion.div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl p-6">
        {!(isEnrolled && profile?.role === 'learner') && (
          <div className="text-center mb-6">
            <div className="text-5xl font-extrabold text-white mb-2">
              <span className="text-3xl">$</span>{course?.price?.toFixed(2) || '0.0'}
            </div>
            <p className="text-gray-500">One-time payment</p>
          </div>
        )}

        {profile?.role === 'learner' ? (
          isEnrolled ? (
            <div className="w-full bg-green-500/20 border border-green-500 text-green-400 py-4 rounded-xl font-bold uppercase flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 mr-2" /> Course Enrolled
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onPurchase}
              className="w-full bg-cyan-500 text-gray-900 py-4 rounded-xl font-bold uppercase flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5 mr-2" /> Enroll
            </motion.button>
          )
        ) : profile?.role === 'instructor' ? (
          (profile?._id === course.instructor_id || profile?.id === course.instructor_id) ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition-colors flex items-center justify-center mb-4"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Course
            </motion.button>
          ) : (
            <button className="w-full bg-gray-600 text-white py-4 rounded-xl font-bold cursor-not-allowed mb-4">
              Instructor View (Not Owner)
            </button>
          )
        ) : (
          <div className="text-center text-gray-500 p-4 border border-gray-700 rounded-lg mb-4">
            <Lock className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm">Log in as learner to purchase</p>
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm mb-4">30-Day Money-Back Guarantee</p>
        </div>

       

        <div className="pt-6 border-t border-gray-700">
          <h4 className="font-bold text-white mb-4">This course includes:</h4>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-center"><Video className="w-5 h-5 mr-3 text-cyan-400" />10 hours on-demand video</li>
            <li className="flex items-center"><FileText className="w-5 h-5 mr-3 text-cyan-400" />5 downloadable resources</li>
            <li className="flex items-center"><Globe className="w-5 h-5 mr-3 text-cyan-400" />Full lifetime access</li>
            <li className="flex items-center"><Award className="w-5 h-5 mr-3 text-cyan-400" />Certificate of completion</li>
            <li className="flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-cyan-400" />Direct instructor support</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}