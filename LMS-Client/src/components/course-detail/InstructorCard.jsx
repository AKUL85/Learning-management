// src/components/course-detail/InstructorCard.jsx
import { motion } from 'framer-motion';
import { User, Star, Award, Users } from 'lucide-react';

export default function InstructorCard({ instructor_name, instructor_bio, total_students = "15,000", total_courses = 5, rating = "4.8", profession, speciality, skills }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700 backdrop-blur-sm"
    >
      <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
      <div className="flex items-center space-x-6">

        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-800"></div>
        </div>


        <div className="flex-1">
          <h4 className="text-2xl font-bold text-white">{instructor_name}</h4>
          <p className="text-gray-400 text-lg">{profession || "Instructor"} {speciality && `• ${speciality}`}</p>
          {instructor_bio && (
            <p className="text-gray-300 mt-3 leading-relaxed">{instructor_bio}</p>
          )}

          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-cyan-300 text-xs rounded-full border border-cyan-900/30">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 mt-5 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-gray-300 font-medium">{rating} Instructor Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">{total_courses} Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">{total_students} Students</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}