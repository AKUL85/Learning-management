// src/components/course-detail/PurchaseCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from "../ui/LoadingSpinner";

import { ShoppingCart, CheckCircle, Lock, Video, FileText, Globe, Award, MessageSquare, Bookmark, Share2, Play, Edit, Download, Loader2 } from 'lucide-react';

export default function PurchaseCard({ course, isEnrolled, onPurchase, onGoToCourse, profile, onPreview, onEdit, courseProgress }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!profile?.user || !course?._id) return;
    setDownloading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/progress/${profile.user}/${course._id}/certificate`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to download certificate');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Certificate download error:', err);
      alert(err.message || 'Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

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
            <div>
              <div className="w-full bg-green-500/20 border border-green-500 text-green-400 py-4 rounded-xl font-bold uppercase flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 mr-2" /> Course Enrolled
              </div>
              {courseProgress?.isCompleted ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center mb-4 shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
                >
                  {downloading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Award className="w-5 h-5 mr-2" /> Download Certificate</>
                  )}
                </motion.button>
              ) : courseProgress ? (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{courseProgress.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Complete all videos to earn your certificate</p>
                </div>
              ) : null}
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