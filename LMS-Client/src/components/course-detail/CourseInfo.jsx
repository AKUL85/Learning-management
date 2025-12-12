// src/components/course-detail/CourseInfo.jsx
import { Star, Users, Clock } from 'lucide-react';

export default function CourseInfo({ course, formatDate }) {
  return (
    <>
      <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{course.title}</h1>
      <p className="text-gray-300 text-lg mb-6">{course.description}</p>

      <div className="flex flex-wrap items-center gap-6 mb-8">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 text-xl">4.7</span>
          <div className="flex">{[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}</div>
          <span className="text-gray-400 text-sm">(1,234 ratings)</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Users className="w-5 h-5" />
          <span>2,500 students</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="w-5 h-5" />
          <span>Last updated {formatDate(course.updatedAt)}</span>
        </div>
      </div>
    </>
  );
}