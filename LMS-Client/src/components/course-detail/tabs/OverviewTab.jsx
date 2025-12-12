// src/components/course-detail/tabs/OverviewTab.jsx
import { motion } from 'framer-motion';
import { CheckSquare, Clock, PlayCircle, Award, Users, Globe, FileText, Headphones } from 'lucide-react';

const LearningObjective = ({ children }) => (
  <div className="flex items-start space-x-4">
    <CheckSquare className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
    <span className="text-gray-300 leading-relaxed">{children}</span>
  </div>
);

const SectionItem = ({ title, lectures, duration, isPreview = false }) => (
  <div className="flex items-center justify-between p-5 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-600/50 transition-all group cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/40 transition">
        {isPreview ? <PlayCircle className="w-6 h-6 text-cyan-400" /> : <div className="w-3 h-3 bg-cyan-400 rounded-full" />}
      </div>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{lectures} lectures • {duration}</p>
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
  const objectives = course.description
    ? course.description.split('. ').filter(s => s.trim().length > 10).slice(0, 8)
    : [
        "Master cloud infrastructure from zero to production-ready",
        "Deploy scalable applications using AWS, GCP, and Azure",
        "Implement CI/CD pipelines with GitHub Actions and Jenkins",
  ];

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
          <SectionItem
            title="Module 1: Cloud Fundamentals & Architecture"
            lectures={12}
            duration="2h 30m"
            isPreview={true}
          />
          <SectionItem
            title="Module 2: Infrastructure as Code with Terraform"
            lectures={18}
            duration="4h 15m"
          />
          <SectionItem
            title="Module 3: Containerization & Kubernetes"
            lectures={22}
            duration="6h 45m"
          />
          <SectionItem
            title="Module 4: CI/CD & Automation"
            lectures={15}
            duration="3h 20m"
          />
          <SectionItem
            title="Bonus: Real-World Project & Certification Prep"
            lectures={8}
            duration="2h 10m"
          />
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-700/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-8 text-gray-300">
              <div className="flex items-center">
                <PlayCircle className="w-6 h-6 mr-2 text-cyan-400" />
                <span className="font-medium">75 lectures</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 mr-2 text-green-400" />
                <span className="font-medium">18h 40m total length</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-2 text-purple-400" />
                <span className="font-medium">All levels</span>
              </div>
            </div>
            <button className="text-cyan-400 font-bold hover:text-cyan-300 transition">
              Expand all sections →
            </button>
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
          <li className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0" />
            Basic understanding of programming (any language)
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0" />
            A computer with internet connection
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0" />
            No prior cloud experience required — we start from zero!
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0" />
            Desire to master modern cloud engineering
          </li>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            "Developers wanting to become cloud-native",
            "DevOps engineers mastering automation",
            "System administrators transitioning to cloud",
            "Students preparing for cloud certifications",
            "Tech leads architecting scalable systems",
            "Anyone breaking into cloud computing in 2025+"
          ].map((target, i) => (
            <div key={i} className="flex items-center p-4 bg-gray-800/40 rounded-lg border border-gray-700">
              <Users className="w-6 h-6 text-indigo-400 mr-4" />
              <span className="text-gray-300">{target}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}