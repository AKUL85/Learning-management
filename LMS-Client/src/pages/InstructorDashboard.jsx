import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  X,
  Upload,
  CheckCircle,
  Clock,
  Users,
  Gauge,
  Code,
  Wallet,
  Zap
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Toast component and hook (unchanged)
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

const useToast = () => {
  const [toastState, setToastState] = useState({ message: '', type: 'success', isVisible: false });
  const showToast = (message, type = 'success') => {
    setToastState({ message, type, isVisible: true });
    setTimeout(() => setToastState(prev => ({ ...prev, isVisible: false })), 3000);
  };
  return { toast: toastState, showToast, setToastState };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#D1D5DB' } },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      titleColor: '#F3F4F6',
      bodyColor: '#E5E7EB',
    }
  },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55, 65, 81, 0.5)' } },
    x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(55, 65, 81, 0.5)' } }
  }
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile, refreshProfile } = useAuth(); // assume your AuthContext provides refreshProfile to update profile after changes
  const { toast, showToast, setToastState } = useToast();

  // Initialize newCourse state with null for file inputs
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', image: null, video: null });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function fetchData() {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/instructor/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch instructor dashboard');
      const data = await res.json();
      setCourses(data.courses || []);
      setTransactions(data.transactions || []);
      // Optionally update profile (bank balance changed in backend)
      if (data.profile && refreshProfile) refreshProfile(data.profile);
    } catch (err) {
      console.error(err);
      showToast('Error: Failed to synchronize data streams.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function createCourse() {
    if (!profile || !newCourse.title || !newCourse.description || !newCourse.price || !newCourse.image || !newCourse.video) {
      showToast('Error: Complete all required input fields.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newCourse.title);
      formData.append("description", newCourse.description);
      formData.append("price", newCourse.price);
      formData.append("image", newCourse.image);
      formData.append("video", newCourse.video);

      // Add debugging
      console.log("Sending FormData with:");
      console.log("Title:", newCourse.title);
      console.log("Image file:", newCourse.image);
      console.log("Video file:", newCourse.video);

      const res = await fetch(`${API_BASE}/api/instructor/course`, {
        method: "POST",
        credentials: "include",
        body: formData, // <---- VERY IMPORTANT
      });

      // Log response for debugging
      const responseText = await res.text();
      console.log("Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        // If the server returns a 500, it might not be JSON, so check res.ok status first
        if (!res.ok) {
            throw new Error(responseText || `Failed to create course: ${res.status}`);
        }
        // If it was OK, but still not JSON, treat it as a success if response is empty
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || `Failed to create course: ${res.status}`);
      }

      showToast("Protocol Deployed. Reward of $500.00 confirmed.", "success");
      setShowCreateModal(false);
      setNewCourse({ title: "", description: "", price: "", image: null, video: null });
      fetchData();

    } catch (err) {
      console.error("Course creation error:", err);
      showToast(err.message || "Error: Failed to deploy new protocol.", "error");
    }
  }


  async function validateTransaction(transaction) {
    try {
      const res = await fetch(`${API_BASE}/api/instructor/transaction/${transaction._id}/validate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to validate');
      showToast(`Transaction ${transaction._id} validated! +$${transaction.amount.toFixed(2)}.`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Error: Failed to execute transaction validation.', 'error');
    }
  }

  const totalEarnings = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');

  const earningsData = {
    labels: courses.map((c) => (c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title)),
    datasets: [
      {
        label: 'Protocol Price ($)',
        data: courses.map((c) => c.price),
        borderRadius: 8,
      },
    ],
  };

  const transactionData = {
    labels: ['Upload Rewards', 'Student Acquisitions', 'Total Revenue'],
    datasets: [
      {
        label: 'Earnings ($)',
        data: [
          transactions.filter((t) => t.type === 'course_upload_reward' && t.status === 'completed').length * 500,
          transactions
            .filter((t) => t.type === 'course_purchase' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0),
          totalEarnings,
        ],
        borderWidth: 2,
      },
    ],
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
            <p className="mt-4 text-gray-400">Synchronizing Instructor Console...</p>
          </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">INSTRUCTOR CONSOLE</h1>
            <p className="text-gray-500 font-light">Management interface for protocol deployment and revenue tracking.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-500 text-gray-900 px-6 py-3 rounded-xl font-bold uppercase shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </motion.button>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div className="bg-gray-800 rounded-xl border-l-4 border-cyan-500 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1 uppercase text-sm"> Total Courses</p>
                <p className="text-4xl font-extrabold text-white font-mono">{courses.length}</p>
              </div>
              <Code className="w-8 h-8 text-cyan-500" />
            </div>
          </motion.div>

          <motion.div className="bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1 uppercase text-sm">Total Revenue</p>
                <p className="text-4xl font-extrabold text-green-400 font-mono">${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          {/* RESTORED ORIGINAL PENDING VALIDATION CARD */}
          <motion.div className="bg-gray-800 rounded-xl border-l-4 border-yellow-500 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1 uppercase text-sm">Pending Validation</p>
                <p className="text-4xl font-extrabold text-yellow-400 font-mono">{pendingTransactions.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div className="bg-gray-800 rounded-xl border-l-4 border-indigo-500 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1 uppercase text-sm">Total Audience</p>
                <p className="text-4xl font-extrabold text-white font-mono">{transactions.filter((t) => t.type === 'course_purchase').length}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">COURSE PRICING STRUCTURE</h2>
            {courses.length > 0 ? <div className="h-72"><Bar data={earningsData} options={chartOptions} /></div> : <p className="text-gray-600 text-center py-8">No pricing data available.</p>}
          </motion.div>

          <motion.div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">REVENUE SOURCE BREAKDOWN</h2>
            <div className="h-72"><Bar data={transactionData} options={chartOptions} /></div>
          </motion.div>
        </div>

        {/* Pending Transactions Queue */}
        {pendingTransactions.length > 0 && (
          <motion.div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-10 border border-yellow-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center"><Gauge className="w-6 h-6 mr-2" /> PENDING TRANSACTION QUEUE</h2>
            <div className="space-y-4">
              {pendingTransactions.map((transaction, index) => (
                <motion.div key={transaction._id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-yellow-600/50 bg-gray-900 rounded-xl hover:bg-gray-700 transition">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <p className="font-semibold text-white font-mono">Course Pending - <span className='text-green-400'>+${transaction.amount.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-500">ID: {transaction._id} | Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <motion.button onClick={() => validateTransaction(transaction)} className="bg-green-600 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors flex items-center shadow-md">
                    <CheckCircle className="w-4 h-4 mr-2" /> VALIDATE
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* My Courses List */}
        <motion.div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">MY DEPLOYED PROTOCOLS</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No protocols are currently deployed to the grid.</p>
              <motion.button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-700 transition inline-flex items-center shadow-lg">
                <Plus className="w-5 h-5 mr-2" /> Create Your First Course
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div key={course._id} className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-cyan-900/40 transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-cyan-400">{course.title}</h3>
                    <span className="bg-green-800/50 text-green-300 px-3 py-1 rounded-full text-sm font-mono border border-green-700">${course.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-indigo-400" />
                    <span className='text-white'>STATUS: <span className='text-green-500'>LIVE</span></span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-cyan-700"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h3 className="text-2xl font-bold text-cyan-400">DEPLOY NEW PROTOCOL</h3>
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 bg-gray-700 hover:bg-red-500 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="bg-green-900/40 border border-green-700 rounded-xl p-4 mb-6 shadow-inner">
                <p className="text-sm text-green-300 flex items-center">
                  <Wallet className='w-4 h-4 mr-2' />
                  Deployment reward:
                  <span className="font-bold ml-1 text-green-400">$500.00</span> will be credited instantly.
                </p>
              </div>

              <div className="space-y-6">

                {/* TITLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Protocol Title</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                    placeholder="e.g., Quantum Computing Fundamentals"
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description / Objectives</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all h-32"
                    placeholder="Briefly describe the learning outcome and target audience..."
                    required
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Acquisition Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all"
                    placeholder="e.g., 99.99"
                    required
                  />
                </div>

                {/* IMAGE INPUT WITH VISUAL CONFIRMATION - CORRECTLY PLACED */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Image File (Thumbnail)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="modal-image-upload" 
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, image: e.target.files[0] })
                      }
                      className="hidden"
                      required
                    />
                    <motion.label
                      htmlFor="modal-image-upload" 
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer bg-gray-700 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center border border-gray-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {newCourse.image ? "Change Image" : "Choose Image File"}
                    </motion.label>

                    <p className="text-sm text-gray-300 truncate max-w-xs">
                      {newCourse.image
                        ? newCourse.image.name
                        : "No image file selected."}
                    </p>
                  </div>
                </div>

                {/* VIDEO INPUT WITH VISUAL CONFIRMATION - CORRECTLY PLACED */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Video File (Content)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="modal-video-upload"
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, video: e.target.files[0] })
                      }
                      className="hidden"
                      required
                    />
                    <motion.label
                      htmlFor="modal-video-upload"
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer bg-gray-700 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center border border-gray-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {newCourse.video ? "Change Video" : "Choose Video File"}
                    </motion.label>

                    <p className="text-sm text-gray-300 truncate max-w-xs">
                      {newCourse.video
                        ? newCourse.video.name
                        : "No video file selected."}
                    </p>
                  </div>
                </div>


                <motion.button
                  onClick={createCourse}
                  className="w-full bg-cyan-500 text-gray-900 py-4 rounded-xl font-bold uppercase shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  CONFIRM DEPLOYMENT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}