// src/components/course-detail/tabs/OverviewTab.jsx
import { motion } from 'framer-motion';
import { CheckSquare, Clock, PlayCircle, Award, Users, Globe, FileText, Headphones } from 'lucide-react';

const LearningObjective = ({ children }) => (
  <div className="flex items-start space-x-4">
    <CheckSquare className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
    <span className="text-gray-300 leading-relaxed">{children}</span>
  </div>
);

const parseDurationSeconds = (dur) => {
  if (!dur) return 0;
  const parts = String(dur).split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const formatTotalSeconds = (totalSec) => {
  if (totalSec <= 0) return null;
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const SectionItem = ({ title, lectures, duration, isPreview = false }) => (
  <div className="flex items-center justify-between p-5 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-600/50 transition-all group cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/40 transition">
        {isPreview ? <PlayCircle className="w-6 h-6 text-cyan-400" /> : <div className="w-3 h-3 bg-cyan-400 rounded-full" />}
      </div>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{lectures} lecture{lectures !== 1 ? 's' : ''}{duration ? ` • ${duration}` : ''}</p>
      </div>
    </div>
    {isPreview && (
      <span className="text-xs font-bold text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded-full">
        PREVIEW
      </span>
    )}
  </div>
);

export default function OverviewTab({ course }) {
  // 1. Objectives (What you'll learn)
  const objectives = (course.objectives && course.objectives.length > 0)
    ? course.objectives
    : (course.description
      ? course.description.split('. ').filter(s => s.trim().length > 10).slice(0, 8)
      : ["Master cloud infrastructure from zero to production-ready"]);

  // 2. Content Preview (Modules)
  // Group videos into modules or just show list? Backend structure is: content: [{ section: "...", videos: [] }]
  const modules = course.content || [];

  // 3. Requirements
  const requirements = course.requirements || [];

  // 4. Audience
  const audience = course.audience || [];

  // Calculate totals
  const totalLectures = modules.reduce((acc, m) => acc + (m.videos ? m.videos.length : 0), 0);

  // Format total duration simply
  const totalDuration = "Variable"; // Real calculation requires summing string durations or backend helper

  return (
    <div className="space-y-12">
      {/* What You'll Learn */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center">
          <Award className="w-8 h-8 mr-3 text-yellow-400" />
          What You'll Learn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {objectives.map((obj, i) => (
            <LearningObjective key={i}>{obj}{obj.endsWith('.') ? '' : '.'}</LearningObjective>
          ))}
        </div>
      </motion.section>

      {/* Course Content Preview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-cyan-400" />
          Course Content
        </h3>

        <div className="space-y-4">
          {modules.map((mod, i) => {
            const modSeconds = (mod.videos || []).reduce((sum, v) => sum + parseDurationSeconds(v.duration), 0);
            return (
              <SectionItem
                key={i}
                title={mod.section || `Module ${i + 1}`}
                lectures={mod.videos ? mod.videos.length : 0}
                duration={formatTotalSeconds(modSeconds)}
                isPreview={i === 0}
              />
            );
          })}
          {modules.length === 0 && <p className="text-gray-400">No content added yet.</p>}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-700/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-8 text-gray-300">
              <div className="flex items-center">
                <PlayCircle className="w-6 h-6 mr-2 text-cyan-400" />
                <span className="font-medium">{totalLectures} lectures</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-2 text-purple-400" />
                <span className="font-medium">All levels</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Requirements */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-2xl font-extrabold text-white mb-6">
          Requirements
        </h3>
        <ul className="space-y-4 text-gray-300">
          {requirements.length > 0 ? (
            requirements.map((req, i) => (
              <li key={i} className="flex items-start">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0" />
                {req}
              </li>
            ))
          ) : (
            <li className="text-gray-400">No specific requirements.</li>
          )}
        </ul>
      </motion.section>

      {/* Who This Course Is For */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-2xl font-extrabold text-white mb-6">
          Who This Course Is For
        </h3>
        <div className="space-y-4">
          {audience.length > 0 ? (
            audience.map((target, i) => (
              <div key={i} className="flex items-center p-4 bg-gray-800/40 rounded-lg border border-gray-700">
                <Users className="w-6 h-6 text-indigo-400 mr-4" />
                <span className="text-gray-300">{target}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No specific audience defined.</p>
          )}
        </div>
      </motion.section >
    </div >
  );
}