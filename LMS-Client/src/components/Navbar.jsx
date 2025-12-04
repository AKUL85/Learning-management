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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-[#232F3E] shadow-xl border-b border-gray-700 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO AREA */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-1.5 rounded bg-[#37475A]">
              <BookOpen className="w-5 h-5 text-[#FF9900]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LearnHub Console</span>
          </Link>

          {/* NAVIGATION AND PROFILE */}
          <div className="flex items-center space-x-6">
            {profile && (
              <>
                {/* Navigation Links */}
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Courses
                </Link>

                <Link
                  to={profile.role === 'instructor' ? '/instructor-dashboard' : '/learner-dashboard'}
                  className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
                >
                  Dashboard
                </Link>

                {/* Wallet / Balance */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-[#37475A] rounded-full border border-green-600">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">
                    ${profile.bank_balance?.toFixed(2) || '0.00'}
                  </span>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium text-white">{profile.full_name}</span>
                    <span className="text-xs text-gray-400 capitalize">{profile.role}</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
