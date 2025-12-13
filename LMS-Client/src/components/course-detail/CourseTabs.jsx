// src/components/course-detail/CourseTabs.jsx
import { motion } from 'framer-motion';
import OverviewTab from './tabs/OverviewTab';
import ContentTab from './tabs/ContentTab';
import MaterialsTab from './tabs/MaterialsTab';
import QuestionsTab from './tabs/QuestionsTab';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'content', label: 'Content' },
  { id: 'materials', label: 'Materials' },
  { id: 'questions', label: 'Questions' },
];

export default function CourseTabs({ activeTab, setActiveTab, course, videoPlaying, setVideoPlaying, isEnrolled, isInstructor, isAdmin }) {
  return (
    <div className="mb-12">
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 font-medium text-sm whitespace-nowrap transition-all duration-300 relative
                ${activeTab === tab.id
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-8"
      >
        {activeTab === 'overview' && <OverviewTab course={course} />}
        {activeTab === 'content' && <ContentTab course={course} videoPlaying={videoPlaying} setVideoPlaying={setVideoPlaying} isEnrolled={isEnrolled} isInstructor={isInstructor} isAdmin={isAdmin} />}
        {activeTab === 'materials' && <MaterialsTab materials={course.materials} />}
        {activeTab === 'questions' && <QuestionsTab mcqs={course.mcqs} cqs={course.cqs} />}
      </motion.div>
    </div>
  );
}