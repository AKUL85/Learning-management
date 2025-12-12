// src/components/course-detail/CourseHeader.jsx
import { ChevronRight } from 'lucide-react';

export default function CourseHeader({ category = "Development", subcategory = "Programming", title }) {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{category}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{subcategory}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{title}</span>
        </div>
      </div>
    </div>
  );
}