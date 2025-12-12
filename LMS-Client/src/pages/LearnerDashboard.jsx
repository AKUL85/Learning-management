import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Play, FileText, Headphones, CheckCircle, Download, ChevronDown, ChevronUp, Zap, Clock, Code } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Navbar from '../components/Navbar'; 

// --- Chart.js Registration ---
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


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
                    // Glassmorphism and Neon Style
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


// --- Main Component ---
export default function LearnerDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  // ------------------------
  // MOCK DATA (Unchanged)
  // ------------------------
  const mockEnrollments = useMemo(() => ([
    {
      id: 1,
      learner_id: "12345",
      course_id: 101,
      is_completed: false,
      certificate_url: null,
      course: {
        title: "Cloud Infrastructure Fundamentals",
        description: "Concepts of compute, storage, and networking in the cloud.",
        instructor_name: "Dr. Virtualization",
      },
    },
    {
      id: 2,
      learner_id: "12345",
      course_id: 102,
      is_completed: true,
      certificate_url: "https://certificate.learnhub.com/2",
      course: {
        title: "Serverless Application Development",
        description: "Building APIs with Function as a Service (FaaS).",
        instructor_name: "Ms. Lambda",
      },
    },
    {
      id: 3,
      learner_id: "12345",
      course_id: 103,
      is_completed: false,
      certificate_url: null,
      course: {
        title: "DevOps and Automation with CI/CD",
        description: "Implementing automated pipelines for deployment.",
        instructor_name: "Engineer Jenkins",
      },
    },
  ]), []);

  const mockMaterials = useMemo(() => ({
    101: [
      { id: 1, title: "Module 1: EC2 and Compute Basics", content_type: "text" },
      { id: 2, title: "Module 2: S3 and Object Storage (Video)", content_type: "video" },
      { id: 3, title: "Quiz 1: Network Concepts", content_type: "mcq" },
    ],
    102: [
      { id: 4, title: "Lecture 1: Intro to FaaS", content_type: "video" },
      { id: 5, title: "Deep Dive: Asynchronous Patterns", content_type: "text" },
    ],
    103: [
        { id: 6, title: "Pipeline Setup Guide", content_type: "text" },
        { id: 7, title: "Security Best Practices", content_type: "audio" },
    ],
  }), []);

  // ------------------------
  // FETCH / COMPLETE LOGIC (Unchanged, uses mock)
  // ------------------------
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      throw new Error("Simulating backend failure to use mock data");
    } catch (err) {
      console.warn("Using mock enrollments:", err.message);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setEnrollments(mockEnrollments);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (courseId) => {
    try {
      throw new Error("Simulating backend failure to use mock data");
    } catch (err) {
      console.warn("Using mock materials");
      setMaterials(mockMaterials[courseId] || []);
    }
  };

  const completeCourse = async (enrollmentId) => {
    try {
      throw new Error("Simulating backend failure to use mock data");
    } catch (err) {
      showToast("Course marked as completed (MOCK)", "success");

      const updated = enrollments.map((e) =>
        e.id === enrollmentId
          ? { ...e, is_completed: true, certificate_url: `https://certificate.learnhub.com/${e.id}` }
          : e
      );

      setEnrollments(updated);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [mockEnrollments]);

  useEffect(() => {
    if (selectedCourseId) fetchMaterials(selectedCourseId);
    else setMaterials([]);
  }, [selectedCourseId, mockMaterials]);

  const completedCount = enrollments.filter((e) => e.is_completed).length;
  const inProgressCount = enrollments.length - completedCount;

  // ------------------------
  // CHART DATA (Styled for Dark Mode)
  // ------------------------
  const pieData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [completedCount, inProgressCount],
        backgroundColor: ['#10B981', '#06B6D4'], // Green and Cyan
        borderColor: '#1F2937', // Dark border
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: enrollments.map((e) => e.course.title.substring(0, 25) + (e.course.title.length > 25 ? '...' : '')),
    datasets: [
      {
        label: 'Progress (%)',
        data: enrollments.map((e) => (e.is_completed ? 100 : 40 + Math.floor(Math.random() * 50))),
        backgroundColor: enrollments.map((e) => (e.is_completed ? '#10B981' : '#0EA5E9')), // Green and Blue/Cyan
        borderColor: enrollments.map((e) => (e.is_completed ? '#059669' : '#0EA5E9')),
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#076D92',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#D1D5DB' } }, // Light gray text for dark mode
        tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.9)', // Darker tooltip background
            titleColor: '#F3F4F6',
            bodyColor: '#E5E7EB',
        }
    },
    scales: {
        y: { 
            beginAtZero: true, 
            max: 100, 
            ticks: { color: '#9CA3AF', callback: (v) => v + "%" }, // Light gray ticks
            grid: { color: 'rgba(55, 65, 81, 0.5)' } // Dark, subtle grid lines
        },
        x: { 
            ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, color: '#9CA3AF' }, // Light gray ticks
            grid: { color: 'rgba(55, 65, 81, 0.5)' }
        }
    }
  };


  const getContentIcon = (type) => {
    const defaultClasses = "w-5 h-5 mr-2";
    switch (type) {
      case 'video': return <Play className={`${defaultClasses} text-red-500`} />;
      case 'audio': return <Headphones className={`${defaultClasses} text-yellow-500`} />;
      case 'text': return <FileText className={`${defaultClasses} text-cyan-400`} />; // Cyan for documentation
      case 'mcq': return <CheckCircle className={`${defaultClasses} text-green-500`} />;
      default: return <FileText className={`${defaultClasses} text-gray-500`} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <Navbar></Navbar>
      <div className="flex flex-col items-center justify-center flex-grow">
          <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400 mt-3">Initializing High-Priority Data Stream...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar></Navbar>
      <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold text-white tracking-wide">
                OPERATIONS CONSOLE
            </h1>
            <p className="text-gray-500 font-light mt-1 mb-6">
                Real-time status of your assigned learning protocols.
            </p>
        </motion.div>

        {/* CARDS (Metric Widgets) - High-Contrast Futuristic Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Total Courses */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-800 rounded-lg border-l-4 border-cyan-500 shadow-xl shadow-cyan-900/40 p-6 transition hover:shadow-cyan-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Protocols</span>
              <BookOpen className="w-6 h-6 text-cyan-500" />
            </div>
            <h2 className="text-5xl font-extrabold text-white mt-2">{enrollments.length}</h2>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-xl shadow-green-900/40 p-6 transition hover:shadow-green-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Protocols Completed</span>
              <Award className="w-6 h-6 text-green-500" />
            </div>
            <h2 className="text-5xl font-extrabold text-white mt-2">{completedCount}</h2>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-gray-800 rounded-lg border-l-4 border-indigo-500 shadow-xl shadow-indigo-900/40 p-6 transition hover:shadow-indigo-500/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Missions</span>
              <TrendingUp className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-5xl font-extrabold text-white mt-2">{inProgressCount}</h2>
          </motion.div>
        </div>

        {/* CHARTS & ANALYTICS - Glassmorphism Style */}
        {enrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
          >
            {/* Enrollment Distribution Pie Chart */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b border-gray-700 pb-2">STATUS DISTRIBUTION</h3>
                <div className="h-64 flex items-center justify-center">
                    <Pie data={pieData} options={chartOptions} />
                </div>
            </div>

            {/* Progress Bar Chart */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b border-gray-700 pb-2">INDIVIDUAL PROGRESS MAPPING</h3>
                <div className="h-64 flex items-center justify-center">
                    <Bar data={barData} options={chartOptions} />
                </div>
            </div>
          </motion.div>
        )}

        {/* COURSES LIST (The Service List Area) - High-Contrast List */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
          <div className="p-4 border-b border-gray-700 bg-gray-700/50">
            <h2 className="text-xl font-bold text-white tracking-wider">ASSIGNED PROTOCOLS LIST</h2>
          </div>

          <div className="divide-y divide-gray-700">
            {enrollments.map((enrollment) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="p-5 hover:bg-gray-700/60 transition"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-3 md:mb-0 md:w-3/5">
                        <h3 className="text-xl font-bold text-cyan-400 cursor-pointer hover:underline">
                            <Code className="inline w-5 h-5 mr-2 text-cyan-500" />
                            {enrollment.course.title}
                        </h3>
                        <p className="text-sm text-gray-400 ml-7">{enrollment.course.description}</p>
                        <span className="text-xs text-gray-500 mt-1 block ml-7">
                            Supervising Agent: {enrollment.course.instructor_name}
                        </span>
                    </div>

                    {/* Status and Action Buttons */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Status Tag */}
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${enrollment.is_completed ? 'bg-green-600/30 text-green-300 border border-green-700 shadow-lg shadow-green-900/50' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-700 shadow-lg shadow-indigo-900/50'}`}>
                            {enrollment.is_completed ? 'PROTOCOL COMPLETE' : 'PROCESSING'}
                        </span>

                        {/* View Materials Button (Toggle) */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center px-3 py-1.5 text-sm font-medium border rounded-lg transition ${selectedCourseId === enrollment.course_id ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                          onClick={() =>
                            setSelectedCourseId(
                              selectedCourseId === enrollment.course_id ? null : enrollment.course_id
                            )
                          }
                        >
                          {selectedCourseId === enrollment.course_id ? "Close Data Feed" : "Access Data Feed"}
                          {selectedCourseId === enrollment.course_id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </motion.button>

                        {/* Complete Button / Certificate Button */}
                        {!enrollment.is_completed ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-green-600 text-white px-3 py-1.5 text-sm font-medium rounded-lg border border-green-700 shadow-md hover:bg-green-700 transition"
                            onClick={() => completeCourse(enrollment.id)}
                          >
                            <Clock className="w-4 h-4 mr-1 inline" /> Execute Completion
                          </motion.button>
                        ) : (
                          <a
                            href={enrollment.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium rounded-lg flex items-center border border-indigo-700 shadow-md hover:bg-indigo-700 transition"
                          >
                            <Download className="mr-1 w-4 h-4" />
                            Download Schema
                          </a>
                        )}
                    </div>
                </div>

                {/* MATERIALS DROPDOWN */}
                {selectedCourseId === enrollment.course_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <h4 className="font-semibold mb-3 text-cyan-400">Data Feed ({materials.length} Segments)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {materials.length > 0 ? materials.map((m) => (
                        <div key={m.id} className="flex items-center p-3 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-600 transition cursor-pointer">
                          {getContentIcon(m.content_type)}
                          <p className="truncate font-mono">{m.title}</p>
                        </div>
                      )) : (
                          <p className="text-gray-500 text-sm">No data segments available in the feed.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


// src/components/dashboard/LearnerDashboard.jsx
// import { useState, useEffect, useMemo } from 'react';
// import Navbar from '../Navbar';
// import DashboardHeader from './DashboardHeader';
// import MetricCards from './MetricCards';
// import ProgressCharts from './ProgressCharts';
// import CourseList from './CourseList';
// import CourseItem from './CourseItem';
// import ToastNotification from './ToastNotification';
// import { Pie, Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function LearnerDashboard() {
//   const [enrollments, setEnrollments] = useState([]);
//   const [selectedCourseId, setSelectedCourseId] = useState(null);
//   const [materials, setMaterials] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

//   const showToast = (msg, type = 'success') => {
//     setToast({ message: msg, type, isVisible: true });
//     setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
//   };

//   // Mock data & logic (same as before)
//   const mockEnrollments = useMemo(() => [/* ... same data */], []);
//   const mockMaterials = useMemo(() => ({/* ... same */}), []);

//   // fetch & complete logic (same, using mock)
//   // ... (keep your existing fetchEnrollments, fetchMaterials, completeCourse)

//   useEffect(() => { fetchEnrollments(); }, []);
//   useEffect(() => { if (selectedCourseId) fetchMaterials(selectedCourseId); }, [selectedCourseId]);

//   const completedCount = enrollments.filter(e => e.is_completed).length;
//   const inProgressCount = enrollments.length - completedCount;

//   // Chart data (same as before)
//   const pieData = { /* ... */ };
//   const barData = { /* ... */ };
//   const chartOptions = { /* ... */ };

//   if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Navbar /><p className="text-cyan-400">Loading...</p></div>;

//   return (
//     <div className="min-h-screen bg-gray-900">
//       <Navbar />
//       <ToastNotification {...toast} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <DashboardHeader />
//         <MetricCards total={enrollments.length} completed={completedCount} inProgress={inProgressCount} />
//         {enrollments.length > 0 && <ProgressCharts pieData={pieData} barData={barData} chartOptions={chartOptions} />}
//         <CourseList>
//           {enrollments.map(enrollment => (
//             <CourseItem
//               key={enrollment.id}
//               enrollment={enrollment}
//               isExpanded={selectedCourseId === enrollment.course_id}
//               onToggle={() => setSelectedCourseId(selectedCourseId === enrollment.course_id ? null : enrollment.course_id)}
//               onComplete={() => completeCourse(enrollment.id)}
//               materials={selectedCourseId === enrollment.course_id ? materials : []}
//             />
//           ))}
//         </CourseList>
//       </div>
//     </div>
//   );
// }