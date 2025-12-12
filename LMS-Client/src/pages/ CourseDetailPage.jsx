// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   BookOpen, User, DollarSign, ShoppingCart, CheckCircle,
//   Lock, Key, CreditCard, ChevronRight, CornerDownRight,
//   BarChart3, Download, Play, FileText, Video, Clock,
//   Calendar, Award, MessageSquare, CheckSquare, FileQuestion,
//   Star, Users, Globe, Bookmark, Share2, ThumbsUp
// } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import { useAuth } from '../context/AuthContext';
// import { useParams } from 'react-router-dom';



// const useNavigate = () => {
//   return (path) => console.log(`Navigating to: ${path}`);
// };



// const Toast = ({ message, type, isVisible, onClose }) => {
//   if (!isVisible) return null;

//   let bgColor = 'bg-green-700/80';
//   let icon = <CheckCircle className="w-5 h-5 mr-2" />;
//   if (type === 'error') {
//     bgColor = 'bg-red-700/80';
//     icon = <ThumbsUp className="w-5 h-5 mr-2" />;
//   }

//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, x: 100 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 100 }}
//           transition={{ duration: 0.3 }}
//           className={`fixed top-4 right-4 p-4 rounded-xl backdrop-blur-md border border-gray-600 shadow-2xl text-white font-semibold z-50 cursor-pointer ${bgColor} flex items-center`}
//           onClick={onClose}
//         >
//           {icon}
//           {message}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const useToast = () => {
//   const [toastState, setToastState] = useState({ message: '', type: 'success', isVisible: false });

//   const showToast = (message, type = 'success') => {
//     setToastState({ message, type, isVisible: true });
//     setTimeout(() => setToastState(prev => ({ ...prev, isVisible: false })), 3000);
//   };

//   return {
//     toast: toastState,
//     showToast,
//     setToastState
//   };
// };


// const API_BASE_URL = 'http://localhost:4000/api';

// const api = {
//   getCourse: async (courseId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
//       if (!response.ok) throw new Error('Failed to fetch course');
//       return await response.json();
//     } catch (error) {
//       console.error('API Error:', error);
//       throw error;
//     }
//   },

//   getCourseList: async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/courses`);
//       if (!response.ok) throw new Error('Failed to fetch courses');
//       return await response.json();
//     } catch (error) {
//       console.error('API Error:', error);
//       throw error;
//     }
//   },

//   checkEnrollment: async (learnerId, courseId) => {
//     await new Promise(resolve => setTimeout(resolve, 300));
//     // In real app, this would be an API call
//     return null;
//   },

//   purchaseCourse: async (purchaseData) => {
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const { bankAccount, bankSecret, amount } = purchaseData;

//     if (bankAccount !== 'valid_account' || bankSecret !== 'valid_secret') {
//       throw new Error('Invalid authentication credentials.');
//     }

//     if (amount > 1500.00) {
//       throw new Error('Insufficient system balance in account.');
//     }

//     return {
//       enrollment: {
//         id: `enrollment_${Date.now()}`,
//         learner_id: purchaseData.learnerId,
//         course_id: purchaseData.courseId,
//         transaction_id: `tx_${Date.now()}`,
//         is_completed: false,
//         enrolled_at: new Date().toISOString()
//       },
//       transaction: {
//         id: `tx_${Date.now()}`,
//         status: 'completed'
//       }
//     };
//   }
// };

// export default function CourseDetailPage() {
//   const { id } = useParams();
//   const [course, setCourse] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [videoPlaying, setVideoPlaying] = useState(false);
//   const [relatedCourses, setRelatedCourses] = useState([]);

//   const { profile, refreshProfile } = useAuth();
//   const navigate = useNavigate();
//   const { toast, showToast, setToastState } = useToast();

//   const [bankAccount, setBankAccount] = useState(profile?.bank_account || '');
//   const [bankSecret, setBankSecret] = useState(profile?.bank_secret || '');
//   const [purchasing, setPurchasing] = useState(false);

//   useEffect(() => {
//     if (id) {
//       fetchCourse();
//       fetchRelatedCourses();
//       checkEnrollment();
//     }
//   }, [id, profile?.id]);

//   const fetchCourse = async () => {
//     try {
//       setLoading(true);

//       const res = await api.getCourse(id);
//       const courseData = res.course || res;

//       setCourse(courseData);
//     } catch (error) {
//       showToast('Error: Failed to load course data', 'error');
//       console.error('Fetch course error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRelatedCourses = async () => {
//     try {
//       const res = await api.getCourseList();
//       const courses = res.courses || res;

//       const filtered = courses
//         .filter(c => c._id !== id)
//         .sort(() => Math.random() - 0.5)
//         .slice(0, 3);

//       setRelatedCourses(filtered);
//     } catch (error) {
//       console.error('Fetch related courses error:', error);
//     }
//   };


//   const checkEnrollment = async () => {
//     if (!profile || !id) return;

//     try {
//       const enrollment = await api.checkEnrollment(profile.id, id);
//       if (enrollment) {
//         setIsEnrolled(true);
//       }
//     } catch (error) {
//       console.error('Error checking enrollment:', error);
//     }
//   };

//   const handlePurchase = async () => {
//     if (!profile || !course) return;

//     if (!profile.bank_account || !profile.bank_secret) {
//       showToast('Error: Bank credentials missing. Navigate to /bank-setup.', 'error');
//       navigate('/bank-setup');
//       return;
//     }

//     if (profile.bank_balance < course.price) {
//       showToast('Error: Insufficient balance in linked account.', 'error');
//       return;
//     }

//     setPurchasing(true);

//     try {
//       const purchaseData = {
//         learnerId: profile.id,
//         courseId: course._id,
//         bankAccount,
//         bankSecret,
//         amount: course.price
//       };

//       await api.purchaseCourse(purchaseData);
//       profile.bank_balance -= course.price;

//       if (refreshProfile) {
//         await refreshProfile();
//       }

//       showToast('Course purchased successfully!', 'success');
//       setShowPurchaseModal(false);
//       setIsEnrolled(true);
//       navigate('/learner-dashboard');
//     } catch (error) {
//       showToast(error.message || 'Error: Failed to complete purchase.', 'error');
//     } finally {
//       setPurchasing(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const downloadMaterial = (material) => {
//     const link = document.createElement('a');
//     link.href = material.url;
//     link.download = material.filename || material.originalname;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const fadeIn = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900">
//         <Navbar />
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//             </svg>
//             <p className="mt-4 text-gray-400">Loading course metadata...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="min-h-screen bg-gray-900">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-16 text-center text-white">
//           <h2 className="text-3xl font-bold text-red-400 mb-4">ERROR 404: COURSE NOT FOUND</h2>
//           <motion.button
//             onClick={() => navigate('/')}
//             className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center mx-auto mt-4"
//           >
//             <ChevronRight className="w-5 h-5 mr-1" /> Return to Home
//           </motion.button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900">
//       <Navbar />
//       <Toast {...toast} onClose={() => setToastState(prev => ({ ...prev, isVisible: false }))} />

//       {/* Course Header */}
//       <div className="bg-gray-800 border-b border-gray-700">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center space-x-2 text-sm text-gray-400">
//             <span>Development</span>
//             <ChevronRight className="w-4 h-4" />
//             <span>Programming</span>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-white">{course.title}</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2">
//             {/* Course Title */}
//             <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
//               {course.title}
//             </h1>

//             {/* Description */}
//             <p className="text-gray-300 text-lg mb-6">
//               {course.description}
//             </p>

//             {/* Ratings and Stats */}
//             <div className="flex flex-wrap items-center gap-6 mb-8">
//               <div className="flex items-center space-x-1">
//                 <span className="text-yellow-400 text-xl">4.7</span>
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
//                   ))}
//                 </div>
//                 <span className="text-gray-400 text-sm">(1,234 ratings)</span>
//               </div>
//               <div className="flex items-center space-x-2 text-gray-400">
//                 <Users className="w-5 h-5" />
//                 <span>2,500 students</span>
//               </div>
//               <div className="flex items-center space-x-2 text-gray-400">
//                 <Clock className="w-5 h-5" />
//                 <span>Last updated {formatDate(course.updatedAt)}</span>
//               </div>
//             </div>

//             {/* Instructor Card */}
//             <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
//               <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
//               <div className="flex items-center space-x-4">
//                 <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
//                   <User className="w-8 h-8 text-white" />
//                 </div>
//                 <div>
//                   <h4 className="text-lg font-bold text-white">{course.instructor_name}</h4>
//                   <p className="text-gray-400">Senior Developer & Instructor</p>
//                   <div className="flex items-center space-x-4 mt-2">
//                     <div className="flex items-center space-x-1">
//                       <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                       <span className="text-gray-300">4.7 Instructor Rating</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Award className="w-4 h-4 text-green-400" />
//                       <span className="text-gray-300">5 Courses</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Users className="w-4 h-4 text-blue-400" />
//                       <span className="text-gray-300">15,000 Students</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Course Content Tabs */}
//             <div className="mb-8">
//               <div className="border-b border-gray-700">
//                 <nav className="flex space-x-8">
//                   {['overview', 'content', 'materials', 'questions', 'reviews'].map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
//                           ? 'border-cyan-500 text-cyan-400'
//                           : 'border-transparent text-gray-400 hover:text-gray-300'
//                         }`}
//                     >
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               {/* Tab Content */}
//               <div className="py-8">
//                 {activeTab === 'overview' && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="space-y-6"
//                   >
//                     <div>
//                       <h3 className="text-2xl font-bold text-white mb-4">What you'll learn</h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {course.description.split('. ').slice(0, 6).map((item, index) => (
//                           <div key={index} className="flex items-start">
//                             <CheckSquare className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
//                             <span className="text-gray-300">{item}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-2xl font-bold text-white mb-4">Course Content</h3>
//                       <div className="space-y-4">
//                         <div className="bg-gray-800/50 rounded-lg p-4">
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <h4 className="text-white font-medium">Introduction</h4>
//                               <p className="text-gray-400 text-sm">3 lectures • 45 min</p>
//                             </div>
//                             <ChevronRight className="w-5 h-5 text-gray-400" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {activeTab === 'content' && (
//                   <div>
//                     <h3 className="text-2xl font-bold text-white mb-6">Course Content</h3>

//                     {/* Video Player */}
//                     {course.video_url && (
//                       <div className="mb-8">
//                         <div className="relative bg-black rounded-xl overflow-hidden mb-4">
//                           {!videoPlaying ? (
//                             <div className="aspect-video relative">
//                               {course.thumbnail_url && (
//                                 <img
//                                   src={course.thumbnail_url}
//                                   alt={course.title}
//                                   className="w-full h-full object-cover"
//                                 />
//                               )}
//                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                                 <button
//                                   onClick={() => setVideoPlaying(true)}
//                                   className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full transition-colors"
//                                 >
//                                   <Play className="w-8 h-8" />
//                                 </button>
//                               </div>
//                             </div>
//                           ) : (
//                             <video
//                               controls
//                               className="w-full aspect-video"
//                               src={course.video_url}
//                               onEnded={() => setVideoPlaying(false)}
//                             />
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === 'materials' && course.materials && course.materials.length > 0 && (
//                   <div>
//                     <h3 className="text-2xl font-bold text-white mb-6">Course Materials</h3>
//                     <div className="space-y-4">
//                       {course.materials.map((material, index) => (
//                         <div
//                           key={material._id}
//                           className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/80 transition-colors"
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                               <FileText className="w-8 h-8 text-cyan-400" />
//                               <div>
//                                 <h4 className="text-white font-medium">
//                                   {material.originalname || material.filename}
//                                 </h4>
//                                 <p className="text-gray-400 text-sm">
//                                   {(material.size / 1024).toFixed(2)} KB • PDF Document
//                                 </p>
//                               </div>
//                             </div>
//                             <button
//                               onClick={() => downloadMaterial(material)}
//                               className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                             >
//                               <Download className="w-4 h-4" />
//                               <span>Download</span>
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === 'questions' && (
//                   <div className="space-y-8">
//                     {/* Multiple Choice Questions */}
//                     {course.mcqs && course.mcqs.length > 0 && (
//                       <div>
//                         <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
//                           <CheckSquare className="w-6 h-6 mr-2" />
//                           Multiple Choice Questions
//                         </h3>
//                         <div className="space-y-6">
//                           {course.mcqs.map((mcq, index) => (
//                             <div key={index} className="bg-gray-800/50 rounded-xl p-6">
//                               <h4 className="text-white font-medium mb-4">
//                                 Q{index + 1}: {mcq.question}
//                               </h4>
//                               <div className="space-y-3">
//                                 {mcq.options.map((option, optIndex) => (
//                                   <div
//                                     key={optIndex}
//                                     className={`p-3 rounded-lg ${option === mcq.answer
//                                         ? 'bg-green-900/30 border border-green-500'
//                                         : 'bg-gray-700/50 hover:bg-gray-700/80'
//                                       }`}
//                                   >
//                                     <div className="flex items-center">
//                                       <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${option === mcq.answer ? 'bg-green-500' : 'bg-gray-600'
//                                         }`}>
//                                         {String.fromCharCode(65 + optIndex)}
//                                       </div>
//                                       <span className="text-gray-300">{option}</span>
//                                       {option === mcq.answer && (
//                                         <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
//                                       )}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Conceptual Questions */}
//                     {course.cqs && course.cqs.length > 0 && (
//                       <div>
//                         <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
//                           <FileQuestion className="w-6 h-6 mr-2" />
//                           Conceptual Questions
//                         </h3>
//                         <div className="space-y-6">
//                           {course.cqs.map((cq, index) => (
//                             <div key={index} className="bg-gray-800/50 rounded-xl p-6">
//                               <h4 className="text-white font-medium mb-4">
//                                 Q{index + 1}: {cq.question}
//                               </h4>
//                               <div className="bg-gray-900/50 rounded-lg p-4">
//                                 <h5 className="text-cyan-400 font-medium mb-2">Answer:</h5>
//                                 <p className="text-gray-300">{cq.answer}</p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Related Courses */}
//             {relatedCourses.length > 0 && (
//               <div>
//                 <h3 className="text-2xl font-bold text-white mb-6">Students also bought</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {relatedCourses.map((relatedCourse) => (
//                     <div
//                       key={relatedCourse._id}
//                       className="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800/80 transition-colors cursor-pointer border border-gray-700"
//                       onClick={() => navigate(`/course/${relatedCourse._id}`)}
//                     >
//                       {relatedCourse.thumbnail_url && (
//                         <div className="h-48 overflow-hidden">
//                           <img
//                             src={relatedCourse.thumbnail_url}
//                             alt={relatedCourse.title}
//                             className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                           />
//                         </div>
//                       )}
//                       <div className="p-4">
//                         <h4 className="text-white font-bold line-clamp-2 mb-2">
//                           {relatedCourse.title}
//                         </h4>
//                         <p className="text-gray-400 text-sm mb-3 line-clamp-2">
//                           {relatedCourse.description}
//                         </p>
//                         <div className="flex justify-between items-center">
//                           <span className="text-lg font-bold text-white">
//                             ${relatedCourse.price}
//                           </span>
//                           <div className="flex items-center space-x-1">
//                             <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                             <span className="text-gray-300">4.7</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Column - Purchase Card */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-24">
//               {/* Course Preview */}
//               {course.thumbnail_url && (
//                 <div className="mb-6">
//                   <div className="relative rounded-xl overflow-hidden">
//                     <img
//                       src={course.thumbnail_url}
//                       alt={course.title}
//                       className="w-full h-48 object-cover"
//                     />
//                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//                       <button
//                         onClick={() => {
//                           setActiveTab('content');
//                           setVideoPlaying(true);
//                         }}
//                         className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
//                       >
//                         <Play className="w-5 h-5" />
//                         <span>Preview this course</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Purchase Card */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl p-6"
//               >
//                 <div className="text-center mb-6">
//                   <div className="text-5xl font-extrabold text-white mb-2">
//                     <span className="text-3xl">$</span>
//                     {course.price.toFixed(2)}
//                   </div>
//                   <p className="text-gray-500">One-time payment</p>
//                 </div>

//                 {profile?.role === 'learner' ? (
//                   isEnrolled ? (
//                     <motion.button
//                       whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => navigate('/learner-dashboard')}
//                       className="w-full bg-green-500 text-gray-900 py-4 rounded-xl font-bold uppercase shadow-lg shadow-green-500/50 hover:bg-green-400 transition-colors flex items-center justify-center mb-4"
//                     >
//                       <CheckCircle className="w-5 h-5 mr-2" />
//                       Go to Course
//                     </motion.button>
//                   ) : (
//                     <motion.button
//                       whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => setShowPurchaseModal(true)}
//                       className="w-full bg-cyan-500 text-gray-900 py-4 rounded-xl font-bold uppercase shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-colors flex items-center justify-center mb-4"
//                     >
//                       <ShoppingCart className="w-5 h-5 mr-2" />
//                       Add to cart
//                     </motion.button>
//                   )
//                 ) : (
//                   <div className="text-center text-gray-500 p-4 border border-gray-700 rounded-lg mb-4">
//                     <Lock className="w-8 h-8 mx-auto mb-2 text-red-500" />
//                     <p className="text-sm">Log in as learner to purchase this course</p>
//                   </div>
//                 )}

//                 <div className="text-center mb-6">
//                   <p className="text-gray-400 text-sm mb-4">30-Day Money-Back Guarantee</p>
//                 </div>

//                 <div className="space-y-4">
//                   <button className="w-full border border-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700/50 transition-colors flex items-center justify-center">
//                     <Bookmark className="w-5 h-5 mr-2" />
//                     Wishlist
//                   </button>
//                   <button className="w-full border border-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700/50 transition-colors flex items-center justify-center">
//                     <Share2 className="w-5 h-5 mr-2" />
//                     Share
//                   </button>
//                 </div>

//                 <div className="mt-6 pt-6 border-t border-gray-700">
//                   <h4 className="font-bold text-white mb-4">This course includes:</h4>
//                   <ul className="space-y-3">
//                     <li className="flex items-center text-gray-300">
//                       <Video className="w-5 h-5 mr-3 text-cyan-400" />
//                       <span>10 hours on-demand video</span>
//                     </li>
//                     <li className="flex items-center text-gray-300">
//                       <FileText className="w-5 h-5 mr-3 text-cyan-400" />
//                       <span>5 downloadable resources</span>
//                     </li>
//                     <li className="flex items-center text-gray-300">
//                       <Globe className="w-5 h-5 mr-3 text-cyan-400" />
//                       <span>Full lifetime access</span>
//                     </li>
//                     <li className="flex items-center text-gray-300">
//                       <Award className="w-5 h-5 mr-3 text-cyan-400" />
//                       <span>Certificate of completion</span>
//                     </li>
//                     <li className="flex items-center text-gray-300">
//                       <MessageSquare className="w-5 h-5 mr-3 text-cyan-400" />
//                       <span>Direct instructor support</span>
//                     </li>
//                   </ul>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Purchase Modal */}
//       <AnimatePresence>
//         {showPurchaseModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//             onClick={() => setShowPurchaseModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-gray-800/90 backdrop-blur-md rounded-2xl border border-cyan-700 shadow-3xl max-w-md w-full p-8"
//             >
//               <h3 className="text-3xl font-bold text-cyan-400 mb-6">Complete Purchase</h3>

//               <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
//                 <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
//                   <span className="text-gray-400">Course</span>
//                   <span className="font-medium text-white">{course.title}</span>
//                 </div>
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-gray-400">Price</span>
//                   <span className="font-extrabold text-green-400 text-xl">${course.price.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center pt-2 border-t border-gray-700">
//                   <span className="text-gray-400">Your Balance</span>
//                   <span className="font-medium text-white">
//                     ${(profile?.bank_balance ?? 0).toFixed(2)}
//                   </span>

//                 </div>
//               </div>

//               <div className="space-y-4 mb-6">
//                 <div className="relative group">
//                   <CreditCard className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400" />
//                   <input
//                     type="text"
//                     value={bankAccount}
//                     onChange={(e) => setBankAccount(e.target.value)}
//                     className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
//                     placeholder="Account ID"
//                     required
//                   />
//                 </div>

//                 <div className="relative group">
//                   <Key className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400" />
//                   <input
//                     type="password"
//                     value={bankSecret}
//                     onChange={(e) => setBankSecret(e.target.value)}
//                     className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
//                     placeholder="Security Key"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-4 pt-4">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setShowPurchaseModal(false)}
//                   className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)" }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={handlePurchase}
//                   disabled={purchasing}
//                   className="flex-1 bg-cyan-500 text-gray-900 py-3 rounded-lg font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
//                 >
//                   {purchasing ? 'Processing...' : 'Complete Purchase'}
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ToastNotification from '../components/Learner-dashboard/ToastNotification';
import CourseHeader from '../components/course-detail/CourseHeader';
import CourseInfo from '../components/course-detail/CourseInfo';
import CourseTabs from '../components/course-detail/CourseTabs';

import PurchaseModal from '../components/course-detail/PurchaseModal';
import RelatedCourses from '../components/course-detail/RelatedCourses';
import PurchaseCard from '../components/course-detail/PurchaseCard';
import InstructorCard from '../components/course-detail/InstructorCard';

const API_BASE_URL = 'http://localhost:4000/api';

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

  getCourseList: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  checkEnrollment: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return null;
  },

  purchaseCourse: async (purchaseData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { bankAccount, bankSecret, amount } = purchaseData;

    if (bankAccount !== 'valid_account' || bankSecret !== 'valid_secret') {
      throw new Error('Invalid authentication credentials.');
    }

    if (amount > 1500.00) {
      throw new Error('Insufficient system balance in account.');
    }

    return {
      enrollment: {
        id: `enr_${Date.now()}`,
        learner_id: purchaseData.learnerId,
        course_id: purchaseData.courseId,
        transaction_id: `tx_${Date.now()}`,
        is_completed: false,
        enrolled_at: new Date().toISOString()
      },
      transaction: {
        id: `tx_${Date.now()}`,
        status: 'completed'
      }
    };
  }
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [bankAccount, setBankAccount] = useState(profile?.bank_account || '');
  const [bankSecret, setBankSecret] = useState(profile?.bank_secret || '');
  const [purchasing, setPurchasing] = useState(false);

  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type, isVisible: true });
    setTimeout(() => setToast(s => ({ ...s, isVisible: false })), 3000);
  };

  useEffect(() => {
    if (!id) return;
    fetchCourse();
    fetchRelatedCourses();
    checkEnrollment();
  }, [id, profile?.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.getCourse(id);
      const courseData = res.course || res;
      setCourse(courseData);
      
    } catch (error) {
      showToast('Failed to load course', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCourses = async () => {
    try {
      const res = await api.getCourseList();
      const courses = res.courses || res;

      const filtered = Array.isArray(courses)
        ? courses.filter(c => c._id !== id).sort(() => Math.random() - 0.5).slice(0, 3)
        : [];

      setRelatedCourses(filtered);
    } catch (error) {
      console.error('Fetch related courses error:', error);
    }
  };

  const checkEnrollment = async () => {
    if (!profile) return;

    try {
      const enrollment = await api.checkEnrollment(profile?.id, id);
      if (enrollment) setIsEnrolled(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePurchase = async () => {
    if (!profile || !course) return;

    if (!profile.bank_account || !profile.bank_secret) {
      showToast('Bank credentials missing. Go to /bank-setup.', 'error');
      navigate('/bank-setup');
      return;
    }

    if ((profile.bank_balance ?? 0) < (course.price ?? 0)) {
      showToast('Insufficient balance.', 'error');
      return;
    }

    setPurchasing(true);

    try {
      const purchaseData = {
        learnerId: profile.id,
        courseId: course._id,
        bankAccount,
        bankSecret,
        amount: course.price
      };

      await api.purchaseCourse(purchaseData);

      if (refreshProfile) await refreshProfile();

      showToast('Purchase successful!', 'success');
      setShowPurchaseModal(false);
      setIsEnrolled(true);

      navigate('/learner-dashboard');
    } catch (error) {
      showToast(error.message || 'Purchase failed', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Navbar />
        <p className="text-cyan-400">Loading course...</p>
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-center text-red-400">Course not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <ToastNotification {...toast} onClose={() => setToast(s => ({ ...s, isVisible: false }))} />

      <CourseHeader title={course.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseInfo course={course} formatDate={formatDate} />
            <InstructorCard instructor_name={course.instructor_name} />
            <CourseTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              course={course}
              videoPlaying={videoPlaying}
              setVideoPlaying={setVideoPlaying}
            />
            <RelatedCourses courses={relatedCourses} />
          </div>

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
              }}
            />
          </div>


        </div>
      </div>

      <AnimatePresence>
        {showPurchaseModal && (
          <PurchaseModal
            course={course}
            profile={profile}
            bankAccount={bankAccount}
            setBankAccount={setBankAccount}
            bankSecret={bankSecret}
            setBankSecret={setBankSecret}
            purchasing={purchasing}
            onConfirm={handlePurchase}
            onClose={() => setShowPurchaseModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
