import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-gray-700/50 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO AREA */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
              LearnHub
            </span>
          </Link>

          {/* NAVIGATION AND PROFILE */}
          <div className="flex items-center space-x-8">
            {profile && (
              <>
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-cyan-400 font-medium text-sm transition-colors duration-200"
                  >
                    Explore Courses
                  </Link>

                  <Link
                    to={
                      profile.role === 'instructor' ? '/instructor-dashboard' :
                        profile.role === 'admin' ? '/admin-dashboard' :
                          '/learner-dashboard'
                    }
                    className="text-gray-400 hover:text-cyan-400 font-medium text-sm transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-700 hidden md:block"></div>

                {/* Wallet / Balance */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50 hover:border-green-500/50 transition-colors duration-300 group cursor-default">
                  <Wallet className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    ${(profile.bankBalance || profile.bank_balance || 0).toFixed(2)}
                  </span>
                </div>

                {/* User Profile */}
                <Link to="/profile" className="flex items-center space-x-3 pl-2 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col leading-none">
                    <span className="text-sm font-semibold text-white">{profile.fullName || profile.full_name}</span>
                    <span className="text-xs text-gray-400 capitalize mt-1">{profile.role}</span>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
