// src/components/course-detail/tabs/ContentTab.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, CheckCircle, Clock, ChevronDown, ChevronUp, FileText, Video, Headphones } from 'lucide-react';

const CurriculumSection = ({ section, index, isEnrolled }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // First section open by default

  const totalDuration = section.lectures.reduce((acc, l) => acc + l.duration, 0);
  const completedInSection = section.lectures.filter(l => l.completed).length;

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 bg-gray-800/70 hover:bg-gray-800/90 transition flex items-center justify-between text-left"
      >
        <div>
          <h4 className="text-lg font-bold text-white">
            {index + 1}. {section.title}
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            {section.lectures.length} lectures • {formatDuration(totalDuration)}
            {completedInSection > 0 && (
              <span className="ml-3 text-green-400">
                • {completedInSection}/{section.lectures.length} completed
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {completedInSection === section.lectures.length && completedInSection > 0 && (
            <CheckCircle className="w-6 h-6 text-green-400" />
          )}
          {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-700"
        >
          {section.lectures.map((lecture, i) => (
            <div
              key={i}
              className={`px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition ${
                lecture.preview ? 'bg-cyan-900/20' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                {lecture.type === 'video' && <Video className="w-5 h-5 text-cyan-400" />}
                {lecture.type === 'reading' && <FileText className="w-5 h-5 text-green-400" />}
                {lecture.type === 'audio' && <Headphones className="w-5 h-5 text-purple-400" />}

                <span className={`text-white ${lecture.completed ? 'line-through opacity-70' : ''}`}>
                  {lecture.title}
                </span>

                {lecture.preview && (
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-900/40 px-3 py-1 rounded-full">
                    PREVIEW
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-400">{formatDuration(lecture.duration)}</span>

                {lecture.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : lecture.locked && !isEnrolled ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : lecture.preview ? (
                  <PlayCircle className="w-5 h-5 text-cyan-400 hover:text-cyan-300 cursor-pointer" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function ContentTab({ course, videoPlaying, setVideoPlaying }) {
  const isEnrolled = true; // Replace with real enrollment check

  // Sample curriculum data
  const curriculum = [
    {
      title: "Introduction to Cloud Infrastructure",
      lectures: [
        { title: "Welcome to the Course", duration: 5, type: "video", preview: true, completed: true },
        { title: "Course Overview & Roadmap", duration: 8, type: "video", preview: true, completed: true },
        { title: "Setting Up Your Cloud Lab", duration: 12, type: "video", completed: true },
      ]
    },
    {
      title: "AWS Fundamentals",
      lectures: [
        { title: "IAM & Security Best Practices", duration: 25, type: "video", locked: true, completed: false },
        { title: "EC2 Deep Dive", duration: 45, type: "video", locked: true },
        { title: "S3 Storage Mastery", duration: 38, type: "video", locked: true },
        { title: "Reading: AWS Well-Architected Framework", duration: 20, type: "reading", locked: true },
      ]
    },
    {
      title: "Advanced Topics & Projects",
      lectures: [
        { title: "Building a Serverless API", duration: 60, type: "video", locked: true },
        { title: "Kubernetes on EKS", duration: 90, type: "video", locked: true },
        { title: "Final Project: Full-Stack Cloud App", duration: 120, type: "video", locked: true },
      ]
    }
  ];

  return (
    <div className="space-y-10">
      {/* Video Player */}
      {course.video_url ? (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-700">
          {!videoPlaying ? (
            <div className="aspect-video relative">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
                  <PlayCircle className="w-24 h-24 text-cyan-400 opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setVideoPlaying(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 p-6 rounded-full shadow-2xl transition"
                >
                  <PlayCircle className="w-16 h-16" />
                </motion.button>
              </div>
            </div>
          ) : (
            <video
              controls
              autoPlay
              className="w-full aspect-video"
              src={course.video_url}
              onEnded={() => setVideoPlaying(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center">
            <PlayCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Preview video coming soon</p>
          </div>
        </div>
      )}

      {/* Curriculum */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-cyan-400" />
          Full Curriculum
        </h3>

        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl p-6 mb-8 border border-cyan-700/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Clock className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">18h 40m</p>
              <p className="text-gray-400">Total length</p>
            </div>
            <div>
              <Video className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">75</p>
              <p className="text-gray-400">Video lectures</p>
            </div>
            <div>
              <CheckCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-gray-400">Downloadable resources</p>
            </div>
          </div>
        </div>

        {isEnrolled ? (
          <div className="space-y-4">
            {curriculum.map((section, i) => (
              <CurriculumSection key={i} section={section} index={i} isEnrolled={isEnrolled} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
            <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-6">
              Enroll to access the full curriculum and start learning
            </p>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition">
              Enroll Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}