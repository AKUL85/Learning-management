import { motion } from 'framer-motion';
import Navbar from '../Navbar';

export default function LoadingSpinner({ message = "Loading...", fullScreen = true, showNavbar = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* Premium Cyberpunk Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative w-24 h-24"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(34, 211, 238, 0.2)"
            strokeWidth="8"
            fill="none"
          />
          {/* Animated Arc */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#cyanGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: [283, 0, 283] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            strokeLinecap="round"
          />
          {/* Inner Glow */}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="rgba(34, 211, 238, 0.1)"
            strokeWidth="4"
          />
          {/* Center Core */}
          <circle cx="50" cy="50" r="12" fill="#22d3ee" className="animate-pulse" />
        </svg>

        {/* Gradient Definition */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Text Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 mt-8 text-lg font-light tracking-wider"
      >
        {message}
      </motion.p>

      {/* Subtle Scanning Dots */}
      <div className="flex space-x-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 bg-cyan-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">
        {showNavbar && <Navbar />}
        {/* Background Grid Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] pointer-events-none" />

        {/* Background Blobs for Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          {content}
        </div>
      </div>
    );
  }

  return content;
}