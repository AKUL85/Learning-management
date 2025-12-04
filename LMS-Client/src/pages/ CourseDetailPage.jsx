import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// The AuthContext and Router components are mocked/handled in a single file scenario
// import { useAuth } from '../context/AuthContext';
// import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, User, DollarSign, ShoppingCart, CheckCircle, Lock, Key, CreditCard, Aperture, Zap, ChevronRight, CornerDownRight, BarChart3, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
// import { toast } from 'react-toastify'; 
// import Navbar from '../components/Navbar';

// --- MOCK IMPLEMENTATIONS (Required for single-file operation) ---

// Mock useParams (since we don't have react-router-dom)
// We'll hardcode the ID to '1' for demonstration.
const useParams = () => ({ id: '1' }); 

// Mock useNavigate (to simulate navigation)
const useNavigate = () => {
    // A simple mock for navigation; in a real environment, this would use react-router-dom.
    return (path) => console.log(`Navigating to: ${path}`);
};

// Mock useAuth and profile data (Crucial for purchase logic)
const useAuth = () => {
    // We need a profile with bank details and a simulated balance
    const [profile, setProfile] = useState({ 
        id: 'learner1', 
        full_name: "GUEST_USER_01", 
        role: "learner",
        bank_account: 'valid_account',
        bank_secret: 'valid_secret',
        bank_balance: 1500.00 // Start with enough balance for the demo
    });

    // Mock function to simulate refreshing profile data (e.g., after a purchase)
    const refreshProfile = async () => {
        // In a real app, this would fetch the new balance from the backend.
        console.log("Profile refresh simulated.");
        // We will update the balance state directly in handlePurchase for simplicity
    };
    
    return { profile, refreshProfile };
};


// Custom Toast/Notification Mock (HIGH-TECH STYLE)
const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    let bgColor = 'bg-green-700/80';
    let icon = <CheckCircle className="w-5 h-5 mr-2" />;
    if (type === 'error') {
        bgColor = 'bg-red-700/80';
        icon = <Zap className="w-5 h-5 mr-2" />;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed top-4 right-4 p-4 rounded-xl backdrop-blur-md border border-gray-600 shadow-2xl text-white font-semibold z-50 cursor-pointer ${bgColor} flex items-center`}
                    onClick={onClose}
                >
                    {icon}
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Mock function to show toast
const useToast = () => {
    const [toastState, setToastState] = useState({ message: '', type: 'success', isVisible: false });

    const showToast = (message, type = 'success') => {
        setToastState({ message, type, isVisible: true });
        setTimeout(() => setToastState(prev => ({ ...prev, isVisible: false })), 3000);
    };

    return {
        toast: toastState,
        showToast,
        setToastState
    };
};
// --- END MOCK IMPLEMENTATIONS ---


// Mock data for demonstration
const mockCourses = [
  {
    id: '1',
    title: 'Complete Web Development Protocol',
    description: 'Acquire full-stack development skills. Master HTMX (HyperText Markup Extensions), CSS, JavaScript, React.js (Component Synthesis), and Node.js (Server Simulation) to build and deploy robust digital frameworks.',
    price: 99.99,
    instructor_id: 'instructor1',
    instructor_name: 'Agent Smith',
    thumbnail_url: null,
    is_published: true,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  },
  {
    id: '2',
    title: 'Data Science Fundamentals',
    description: 'Master the fundamentals of data science with Python, pandas, numpy, and machine learning algorithms.',
    price: 149.99,
    instructor_id: 'instructor2',
    instructor_name: 'Sarah Johnson',
    thumbnail_url: null,
    is_published: true,
    created_at: '2024-01-20',
    updated_at: '2024-01-20'
  }
];

const mockEnrollments = [
  {
    id: 'enrollment1',
    learner_id: 'learner1',
    course_id: '1',
    transaction_id: 'tx1',
    is_completed: false,
    completed_at: null,
    certificate_url: null,
    enrolled_at: '2024-01-25'
  }
];

// Mock API functions
const api = {
  getCourse: async (courseId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  },

  checkEnrollment: async (learnerId, courseId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate enrollment check
    const enrollment = mockEnrollments.find(
      e => e.learner_id === learnerId && e.course_id === courseId
    );
    return enrollment || null;
  },

  purchaseCourse: async (purchaseData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { bankAccount, bankSecret, amount } = purchaseData;
    
    // Mock Validation: These values come from the mocked useAuth profile
    if (bankAccount !== 'valid_account' || bankSecret !== 'valid_secret') {
      throw new Error('Invalid authentication credentials.');
    }

    // Mock Balance Check: Use a static limit for demonstration
    if (amount > 1500.00) { 
      throw new Error('Insufficient system balance in account.');
    }

    // Create enrollment (Mock logic)
    const newEnrollment = {
      id: `enrollment_${Date.now()}`,
      learner_id: purchaseData.learnerId,
      course_id: purchaseData.courseId,
      transaction_id: `tx_${Date.now()}`,
      is_completed: false,
      completed_at: null,
      certificate_url: null,
      enrolled_at: new Date().toISOString()
    };

    mockEnrollments.push(newEnrollment);
    
    return {
      enrollment: newEnrollment,
      transaction: {
        id: newEnrollment.transaction_id,
        status: 'completed'
      }
    };
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // Use profile data from mock AuthContext
  const { profile, refreshProfile } = useAuth(); 
  const navigate = useNavigate();
  const { toast, showToast, setToastState } = useToast();

  // State for the modal inputs (which should ideally use profile data)
  // For demo: we'll use profile's data as default input values
  const [bankAccount, setBankAccount] = useState(profile?.bank_account || '');
  const [bankSecret, setBankSecret] = useState(profile?.bank_secret || '');
  const [purchasing, setPurchasing] = useState(false);


  useEffect(() => {
    if (id) {
      fetchCourse();
      checkEnrollment();
    }
  }, [id, profile?.id]); // Depend on ID and profile ID

  const fetchCourse = async () => {
    try {
      const courseData = await api.getCourse(id);
      setCourse(courseData);
    } catch (error) {
      showToast('Error: Failed to load protocol data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!profile || !id) return;

    try {
      const enrollment = await api.checkEnrollment(profile.id, id);
      if (enrollment) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handlePurchase = async () => {
    if (!profile || !course) return;

    if (!profile.bank_account || !profile.bank_secret) {
      showToast('Error: Bank credentials missing. Navigate to /bank-setup.', 'error');
      navigate('/bank-setup');
      return;
    }

    if (profile.bank_balance < course.price) {
      showToast('Error: Insufficient balance in linked account.', 'error');
      return;
    }

    setPurchasing(true);

    try {
      const purchaseData = {
        learnerId: profile.id,
        courseId: course.id,
        // Using the state variables which hold the required valid demo credentials
        bankAccount,
        bankSecret, 
        amount: course.price
      };

      await api.purchaseCourse(purchaseData);

      // --- MOCK PROFILE UPDATE ---
      // This part simulates updating the global profile state after successful purchase
      profile.bank_balance -= course.price; 
      // This is a direct mutation on the mock object for demonstration.
      // In a real app, this would be handled via the AuthContext state setter.
      // --- END MOCK PROFILE UPDATE ---

      if (refreshProfile) {
        await refreshProfile();
      }

      showToast('Protocol access granted. Transaction confirmed.', 'success');
      setShowPurchaseModal(false);
      setIsEnrolled(true);
      navigate('/learner-dashboard');
    } catch (error) {
      showToast(error.message || 'Error: Failed to execute transaction.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  // --- Animation Variants ---
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-gray-400">Loading course metadata...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold text-red-400 mb-4">ERROR 404: PROTOCOL NOT FOUND</h2>
          <motion.button
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center mx-auto mt-4"
          >
            <ChevronRight className="w-5 h-5 mr-1" /> Return to Knowledge.Grid
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Toast {...toast} onClose={() => setToastState(prev => ({ ...prev, isVisible: false }))} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          {...fadeIn}
          className="bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
        >
          {/* Header/Banner Section */}
          <div className="h-64 bg-gradient-to-br from-indigo-900 to-gray-900 relative flex items-center justify-center border-b border-cyan-700/50">
            <BookOpen className="w-32 h-32 text-indigo-400/20 absolute" />
            <div className="relative z-10 text-center text-white p-4">
              <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                {course.title}
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-400 mt-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span className="text-lg font-mono">Supervising Agent: {course.instructor_name}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">PROTOCOL OVERVIEW</h2>
                <p className="text-gray-400 leading-relaxed mb-8 font-light">{course.description}</p>

                {/* Key Metrics/Learnings Box */}
                <div className="bg-gray-800 border border-indigo-700 rounded-xl p-6 mb-6 shadow-inner shadow-gray-900/50">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-400" />
                    ACQUISITION OBJECTIVES
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start text-sm">
                      <CornerDownRight className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Comprehensive data streams and material sets.</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CornerDownRight className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Video tutorials, interactive simulations, and text manifests.</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CornerDownRight className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Interactive diagnostic assessments.</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CornerDownRight className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Verified System Completion Certificate upon execution.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-cyan-700 shadow-2xl p-6 sticky top-24"
                >
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-white mb-2">
                      <DollarSign className="inline w-6 h-6 mr-1 text-green-400" />
                      {course.price.toFixed(2)}
                    </div>
                    <p className="text-gray-500">One-time System Acquisition Cost</p>
                  </div>

                  {profile?.role === 'learner' ? (
                    isEnrolled ? (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/learner-dashboard')}
                        className="w-full bg-green-500 text-gray-900 py-4 rounded-xl font-bold uppercase shadow-lg shadow-green-500/50 hover:bg-green-400 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        ACCESS PROTOCOL
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPurchaseModal(true)}
                        className="w-full bg-cyan-500 text-gray-900 py-4 rounded-xl font-bold uppercase shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        ACQUIRE PROTOCOL
                      </motion.button>
                    )
                  ) : (
                    <div className="text-center text-gray-500 p-4 border border-gray-700 rounded-lg">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p className="text-sm">Access denied. Only LEARNER profiles can initiate acquisition.</p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-700 space-y-3 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Access Status</span>
                      <span className="font-medium text-white">LIFETIME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Certification Schema</span>
                      <span className="font-medium text-white">INCLUDED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security Clearance</span>
                      <span className="font-medium text-white">LEVEL ONE +</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-cyan-700 shadow-3xl max-w-md w-full p-8"
            >
              <h3 className="text-3xl font-bold text-cyan-400 mb-6">EXECUTE ACQUISITION</h3>

              {/* Transaction Summary */}
              <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                  <span className="text-gray-400 font-mono">Protocol Title</span>
                  <span className="font-medium text-white">{course.title.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 font-mono">Acquisition Cost</span>
                  <span className="font-extrabold text-green-400 text-xl">${course.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-gray-400 font-mono">Current System Balance</span>
                  <span className="font-medium text-white">${profile?.bank_balance.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Inputs */}
              <div className="space-y-4 mb-6">
                <div className="relative group">
                  <CreditCard className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                    placeholder="Linked Account ID"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Demo: Required ID is "valid_account"
                  </p>
                </div>

                <div className="relative group">
                  <Key className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="password"
                    value={bankSecret}
                    onChange={(e) => setBankSecret(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                    placeholder="Transaction Key"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Demo: Required Key is "valid_secret"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  <Lock className="w-5 h-5 mr-1 inline" /> Abort Transaction
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePurchase}
                  disabled={purchasing || !bankAccount || !bankSecret}
                  className="flex-1 bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-gray-900" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        EXECUTING...
                    </span>
                  ) : (
                    'CONFIRM ACQUISITION'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}