import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CourseHeader from '../components/course-detail/CourseHeader';
import CourseInfo from '../components/course-detail/CourseInfo';
import InstructorCard from '../components/course-detail/InstructorCard';
import CourseTabs from '../components/course-detail/CourseTabs';
import PurchaseCard from '../components/course-detail/PurchaseCard';
import PurchaseModal from '../components/course-detail/PurchaseModal';
import WalletModal from '../components/profile/WalletModal';
import { useAuth } from '../context/AuthContext';

const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  let bgColor = 'bg-green-700/80';
  let icon = <CheckCircle className="w-5 h-5 mr-2" />;
  if (type === 'error') {
    bgColor = 'bg-red-700/80';
    icon = <ThumbsUp className="w-5 h-5 mr-2" />;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = {
  getCourse: async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  checkEnrollment: async (learnerId, courseId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return null;
  },

  purchaseCourse: async (purchaseData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { status: 'success' };
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast, showToast, setToastState } = useToast();

  const [course, setCourse] = useState(null);
  const [instructorStats, setInstructorStats] = useState({ totalCourses: 0, totalStudents: 0, rating: "N/A" });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Purchase State
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      checkEnrollment();
    }
  }, [id, profile?.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.getCourse(id);
      const courseData = res.course || res;
      setCourse(courseData);
      if (res.instructorStats) {
        setInstructorStats(res.instructorStats);
      }
    } catch (error) {
      console.error('Fetch course error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!profile || !id) return;
    try {
      // Check if course ID exists in enrolledCourses
      // Handle both ObjectId strings or populated objects if applicable (usually strings in this context)
      const enrolled = profile.enrolledCourses?.some(c => c === id || c._id === id);

      if (enrolled) {
        setIsEnrolled(true);
      } else {
        // Fallback to API if profile isn't fully updated or structure differs
        // Keeping it simple for now as we added the field to profile
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handlePurchase = async () => {
    if (!profile || !course) return;

    // Check balance
    if ((profile.bankBalance || profile.bank_balance || 0) < course.price) {
      showToast('Insufficient balance. Please recharge your wallet.', 'error');
      setShowPurchaseModal(false);
      setShowWalletModal(true);
      return;
    }

    setPurchasing(true);

    try {
      // Use new transaction API
      const response = await fetch(`${API_BASE_URL}/transactions/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: profile.user, // Send User ID, as profile.id is Profile ID
          courseId: course._id
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Purchase failed');

      if (refreshProfile) {
        await refreshProfile();
      }

      showToast('Course purchased successfully!', 'success');
      setShowPurchaseModal(false);
      setIsEnrolled(true);
      navigate('/learner-dashboard');
    } catch (error) {
      showToast(error.message || 'Error: Failed to complete purchase.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold text-red-400 mb-4">ERROR 404: COURSE NOT FOUND</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Toast {...toast} onClose={() => setToastState(prev => ({ ...prev, isVisible: false }))} />

      <CourseHeader title={course.title} />

      {/* Admin Warning Banner */}
      {(course.status === 'pending' || course.status === 'rejected') && profile?.role === 'admin' && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 text-center py-3">
          <p className="text-yellow-400 font-bold tracking-wide">
            ADMIN MODE: VIEWING {course.status.toUpperCase()} COURSE
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2">
            <CourseInfo course={course} formatDate={formatDate} />

            <InstructorCard
              instructor_name={course.instructor_name}
              instructor_bio="Senior Developer & Instructor" // Placeholder or add to backend
              total_students={instructorStats.totalStudents}
              total_courses={instructorStats.totalCourses}
              rating={instructorStats.rating}
            />

            <CourseTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              course={course}
              videoPlaying={videoPlaying}
              setVideoPlaying={setVideoPlaying}
              isEnrolled={isEnrolled}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PurchaseCard
              course={course}
              isEnrolled={isEnrolled}
              profile={profile}
              onPurchase={() => setShowPurchaseModal(true)}
              onGoToCourse={() => navigate('/learner-dashboard')}
              onPreview={() => {
                setActiveTab('content');
                setVideoPlaying(true);
                window.scrollTo({ top: 800, behavior: 'smooth' }); // Scroll to content
              }}
              onEdit={() => navigate(`/instructor/course/${course._id}/edit`)}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPurchaseModal && (
          <PurchaseModal
            course={course}
            profile={profile}
            purchasing={purchasing}
            onConfirm={handlePurchase}
            onClose={() => setShowPurchaseModal(false)}
            onRecharge={() => {
              setShowPurchaseModal(false);
              setShowWalletModal(true);
            }}
          />
        )}
        {showWalletModal && (
          <WalletModal
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            balance={profile?.bankBalance || profile?.bank_balance || 0}
            onRecharge={(newBalance) => {
              if (refreshProfile) refreshProfile();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
