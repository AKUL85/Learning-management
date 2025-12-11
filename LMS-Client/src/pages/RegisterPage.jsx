import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Lock, Mail, User, Shield, GraduationCap, Code } from 'lucide-react'; 

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('learner');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
     
      await signUp(email, password, fullName, role);
      toast.success('Account created successfully! Preparing your workspace...');
  
      navigate('/bank-setup'); 
    } catch (error) {
      toast.error(error.message || 'Failed to initialize system account');
    } finally {
      setIsLoading(false);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };


  const RoleButton = ({ currentRole, targetRole, icon: Icon, label }) => (
    <motion.button
      type="button"
      onClick={() => setRole(targetRole)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        currentRole === targetRole
          ? 'border-cyan-500 bg-cyan-900/40 shadow-xl shadow-cyan-500/20'
          : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50' 
      } flex flex-col items-center`}
    >
      <Icon className={`w-6 h-6 mb-2 transition-colors ${currentRole === targetRole ? 'text-cyan-400' : 'text-gray-500'}`} />
      <span className={`font-medium text-sm transition-colors ${currentRole === targetRole ? 'text-white' : 'text-gray-400'}`}>{label}</span>
    </motion.button>
  );

  return (
    
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
     
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm z-10"
      >
    
        <div className="text-center mb-10">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4 shadow-2xl shadow-cyan-500/50"
          >
            <Shield className="w-8 h-8 text-gray-900" /> 
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-white mb-2 tracking-wide">
            System Enrollment
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-400 font-light">
            Register your profile to access the knowledge base
          </motion.p>
        </div>

       
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-8 transition duration-500 hover:shadow-cyan-500/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
          
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <User className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                  placeholder="Designation Name"
                  required
                />
              </div>
            </motion.div>

      
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                  placeholder="Secure Gmail Id"
                  required
                />
              </div>
            </motion.div>

       
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                  placeholder="Access Password (Min 6 chars)"
                  required
                  minLength={6}
                />
              </div>
            </motion.div>

       
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                System Role Assignment
              </label>
              <div className="grid grid-cols-2 gap-4">
                <RoleButton 
                  currentRole={role} 
                  targetRole="learner" 
                  icon={GraduationCap} 
                  label="Learner (User)" 
                />
                <RoleButton 
                  currentRole={role} 
                  targetRole="instructor" 
                  icon={Code} 
                  label="Instructor (Admin)" 
                />
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.5)" }} 
              whileTap={{ scale: 0.95 }}
              className="w-full bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-900" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Enrollment...
                </span>
              ) : (
                'Initiate Account Creation'
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have credentials?{' '}
              <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}