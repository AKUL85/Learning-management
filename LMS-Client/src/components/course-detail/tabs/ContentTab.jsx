// src/components/course-detail/tabs/ContentTab.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, CheckCircle, Clock, ChevronDown, ChevronUp, FileText, Video, Headphones, Circle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const CurriculumSection = ({ section, index, isEnrolled, onVideoSelect, onToggleComplete, isInstructor, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // First section open by default

  const totalDuration = section.lectures.length + " lectures";
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
              className={`px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition ${lecture.preview ? 'bg-cyan-900/20' : ''}`}
            >
              <div
                className="flex items-center space-x-4 cursor-pointer flex-grow"
                onClick={() => onVideoSelect(lecture.video_url)}
              >
                {lecture.type === 'video' && <Video className={`w-5 h-5 ${lecture.completed ? 'text-green-500' : 'text-cyan-400'}`} />}
                {lecture.type === 'reading' && <FileText className="w-5 h-5 text-green-400" />}
                {lecture.type === 'audio' && <Headphones className="w-5 h-5 text-purple-400" />}

                <span className={`text-white ${lecture.completed ? 'opacity-70' : ''}`}>
                  {lecture.title}
                </span>

                {lecture.preview && (
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-900/40 px-3 py-1 rounded-full">
                    PREVIEW
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm z-10">
                <span className="text-gray-400 mr-2">{formatDuration(lecture.duration)}</span>

                {isEnrolled && !isInstructor && !isAdmin ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (lecture._id) onToggleComplete(lecture._id);
                    }}
                    className="focus:outline-none transform active:scale-95 transition"
                    title="Mark as complete"
                  >
                    {lecture.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 hover:text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-500 hover:text-gray-300" />
                    )}
                  </button>
                ) : lecture.locked ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const formatDuration = (input) => {
  if (typeof input === 'number') {
    const h = Math.floor(input / 60);
    const m = input % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  return input || '0m';
};

export default function ContentTab({ course, videoPlaying, setVideoPlaying, isEnrolled, isInstructor, isAdmin }) {
  const { user } = useAuth();
  const [currentVideoUrl, setCurrentVideoUrl] = useState(course?.video_url || (course?.content?.[0]?.videos?.[0]?.video_url));
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (user && course?._id) {
      axios.get(`http://localhost:4000/api/progress/${user._id}/${course._id}`)
        .then(res => setProgress(res.data.progress))
        .catch(err => console.error("Error fetching progress", err));
    }
  }, [user, course]);

  const handleToggleComplete = async (videoId) => {
    if (!user) return;
    try {
      const res = await axios.post(`http://localhost:4000/api/progress/${user._id}/${course._id}`, { videoId });
      setProgress(res.data.progress);
    } catch (err) {
      console.error("Error updating progress", err);
    }
  };

  // Transform backend content to component structure
  const curriculum = course.content ? course.content.map(section => ({
    title: section.section,
    lectures: section.videos.map(video => ({
      _id: video._id, // Ensure ID is passed
      title: video.title,
      duration: video.duration,
      type: 'video',
      video_url: video.video_url,
      preview: false,
      completed: progress?.completedVideos?.includes(video._id) || false,
      locked: false
    }))
  })) : [];

  return (
    <div className="space-y-10">
      {/* Video Player */}
      {(currentVideoUrl || course.video_url) ? (
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
              key={currentVideoUrl || course.video_url}
              controls
              autoPlay
              className="w-full aspect-video"
              src={currentVideoUrl || course.video_url}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
            <div>
              <Clock className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                Variable
              </p>
              <p className="text-gray-400">Total length</p>
            </div>
            <div>
              <Video className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {curriculum.reduce((acc, sec) => acc + sec.lectures.length, 0)}
              </p>
              <p className="text-gray-400">Video lectures</p>
            </div>
            <div>
              <CheckCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {progress?.percentage || 0}%
              </p>
              <p className="text-gray-400">Completion</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-400 bg-cyan-900/30">
                  Course Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-cyan-400">
                  {progress?.percentage || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress?.percentage || 0}%` }}
                transition={{ duration: 1 }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 to-purple-500"
              ></motion.div>
            </div>
          </div>

          {/* Download Certificate Button */}
          {progress?.isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <a
                href={`http://localhost:4000/api/progress/${user._id}/${course._id}/certificate`}
                download
                className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-green-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 hover:bg-green-700"
              >
                <FileText className="w-5 h-5 mr-2" />
                Download Certificate
                <div className="absolute inset-0 w-full h-full rounded-xl blur-lg bg-green-500/30 -z-10 group-hover:bg-green-500/50 transition-all"></div>
              </a>
            </motion.div>
          )}
        </div>

        {isEnrolled ? (
          <div className="space-y-4">
            {curriculum.map((section, i) => (
              <CurriculumSection
                key={i}
                section={section}
                index={i}
                isEnrolled={isEnrolled}
                onVideoSelect={(url) => {
                  setCurrentVideoUrl(url);
                  setVideoPlaying(true);
                }}
                onToggleComplete={handleToggleComplete}
                isInstructor={isInstructor}
                isAdmin={isAdmin}
              />
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