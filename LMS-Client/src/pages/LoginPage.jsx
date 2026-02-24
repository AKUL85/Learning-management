import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Atom, Lock, Mail } from 'lucide-react'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back, User!');
      navigate('/');
    } catch (error) {
      
      toast.error(error.message || 'Authentication failed. Check your credentials.');
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

  return (
  
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
     
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
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
            <Atom className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-white mb-2 tracking-wide">
            Access Portal
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-400 font-light">
            Authenticate to begin your secure session
          </motion.p>
        </div>

       
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-8 transition duration-500 hover:shadow-cyan-500/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                  placeholder="Email"
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
                  placeholder="Password"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.5)" }} // Neon glow effect on hover
              whileTap={{ scale: 0.95 }}
              className="w-full bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-gray-900" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initializing...
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              New to the system?{' '}
              <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                Create a Profile
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}