// src/components/course-detail/RelatedCourses.jsx
import { motion } from 'framer-motion';
import { Star, Play, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RelatedCourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.15)" }}
      onClick={() => navigate(`/course/${course._id}`)}
      className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-600/60 transition-all duration-300 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center">
            <Play className="w-16 h-16 text-cyan-400 opacity-70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChevronRight className="w-8 h-8 text-cyan-400 bg-black/50 rounded-full p-1" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className="text-white font-bold text-lg line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
          {course.title}
        </h4>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-white">${course.price}</span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-sm text-gray-500 line-through">${course.original_price}</span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-medium">4.8</span>
            <span className="text-gray-500 text-sm">(892)</span>
          </div>
        </div>

        {/* Instructor (optional) */}
        <p className="text-xs text-gray-500 mt-3 truncate">
          by {course.instructor_name || 'Expert Instructor'}
        </p>
      </div>
    </motion.div>
  );
};

export default function RelatedCourses({ courses = [] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-extrabold text-white tracking-wide">
          Students Also Viewed
        </h3>
        <div className="hidden md:flex items-center text-cyan-400 font-medium hover:text-cyan-300 cursor-pointer transition">
          View All
          <ChevronRight className="w-5 h-5 ml-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <RelatedCourseCard course={course} />
          </motion.div>
        ))}
      </div>

      {/* Mobile "View All" */}
      <div className="md:hidden text-center mt-10">
        <button className="text-cyan-400 font-medium hover:text-cyan-300 transition">
          View All Related Courses →
        </button>
      </div>
    </section>
  );
}