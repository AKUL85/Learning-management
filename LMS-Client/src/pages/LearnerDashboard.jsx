import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

// Component Imports
import Toast from '../components/ui/Toast';
import DashboardLoader from '../components/dashboard/DashboardLoader';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MetricCards from '../components/dashboard/MetricCards';
import ProgressCharts from '../components/dashboard/ProgressCharts';
import CourseList from '../components/dashboard/CourseList';

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


  const { profile, refreshProfile } = useAuth();
  const [progressData, setProgressData] = useState({});

  useEffect(() => {

    if (refreshProfile) refreshProfile().then(() => setLoading(false));
    else setLoading(false);
  }, []);


  useEffect(() => {
    const fetchAllProgress = async () => {
      if (!profile?.user) return; // Wait for profile to be loaded
      try {
        // Use configured API URL or default
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await axios.get(`${API_BASE}/api/progress/${profile.user}/all`);
        const pData = {};
        if (res.data.progress) {
          res.data.progress.forEach(p => {
            // Store by course ID string. Handle both populated object and direct ObjectId reference
            const cId = p.course && p.course._id ? p.course._id.toString() : String(p.course);
            pData[cId] = p;
          });
        }
        setProgressData(pData);
      } catch (err) {
        console.error("Error fetching dashboard progress", err);
      }
    };

    // Fetch immediately if profile fits
    if (profile?.user) {
      fetchAllProgress();
    }
  }, [profile]); // dependence on profile ensures re-run if context updates profile object

  useEffect(() => {
    if (profile?.enrolledCourses) {
      // Map backend courses to dashboard structure
      const mappedEnrollments = profile.enrolledCourses.map(course => {
        // Robust ID matching: Convert to string to avoid mismatch
        const courseIdStr = typeof course._id === 'object' ? course._id.toString() : String(course._id);
        const courseProgress = progressData[courseIdStr];

        let completionPercentage = 0;
        let isCompleted = false;

        if (courseProgress) {
          isCompleted = courseProgress.isCompleted;

          // Calculate percentage based on video count
          let totalVideos = 0;
          if (course.content) {
            course.content.forEach(s => {
              if (s.videos) totalVideos += s.videos.length;
            });
          }

          const completedCount = courseProgress.completedVideos?.length || 0;

          if (totalVideos > 0) {
            // Prevent percentage > 100 which theoretically shouldn't happen but safe to cap
            completionPercentage = Math.min(100, Math.round((completedCount / totalVideos) * 100));
          } else if (isCompleted) {
            // If no videos but marked complete (e.g. manually), show 100%
            completionPercentage = 100;
          }
        }

        return {
          id: course._id,
          learner_id: profile.user,
          course_id: course._id,
          is_completed: isCompleted,
          completion_percentage: completionPercentage,
          // Certificate URL generation (mock for now, but based on real status)
          certificate_url: isCompleted ? `http://localhost:4000/api/certificates/${course._id}` : null,
          course: {
            title: course.title,
            description: course.description,
            instructor_name: course.instructor_name || "Unknown Instructor",
          },
          fullCourseData: course
        };
      });
      setEnrollments(mappedEnrollments);
    }
  }, [profile, progressData]);

  const fetchMaterials = async (courseId) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    if (enrollment && enrollment.fullCourseData) {
      // Flatten content and materials for the view
      // The dashboard expects: { id, title, content_type }
      const mixedMaterials = [];

      // Add downloadable materials
      if (enrollment.fullCourseData.materials) {
        enrollment.fullCourseData.materials.forEach((m, idx) => {
          mixedMaterials.push({
            id: `mat-${idx}`,
            title: `Resource: ${m.title}`,
            content_type: 'text' // generic for downloadables
          });
        });
      }

      // Add Video Content
      if (enrollment.fullCourseData.content) {
        enrollment.fullCourseData.content.forEach((section, sIdx) => {
          if (section.videos) {
            section.videos.forEach((v, vIdx) => {
              mixedMaterials.push({
                id: `vid-${sIdx}-${vIdx}`,
                title: `Video: ${v.title}`,
                content_type: 'video'
              });
            });
          }
        });
      }

      setMaterials(mixedMaterials);
    } else {
      setMaterials([]);
    }
  };

  const completeCourse = async (enrollmentId) => {
    // Placeholder for now as backend doesn't track status per enrollment yet
    showToast("Completion tracking coming soon!", "success");
  };

  // Toggle course expand/materials using the existing logic
  const handleToggleCourse = (courseId) => {
    const newSelectedId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newSelectedId);
    if (newSelectedId) {
      fetchMaterials(newSelectedId);
    }
  };

  // ------------------------
  // CHART DATA (Styled for Dark Mode)
  // ------------------------
  const completedCount = enrollments.filter((e) => e.is_completed).length;
  const inProgressCount = enrollments.length - completedCount;

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
        data: enrollments.map((e) => e.completion_percentage || 0),
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

  if (loading) return <DashboardLoader />;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar></Navbar>
      <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <DashboardHeader />

        {/* CARDS (Metric Widgets) */}
        <MetricCards
          totalProtocols={enrollments.length}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
        />

        {/* CHARTS & ANALYTICS */}
        {enrollments.length > 0 && (
          <ProgressCharts
            pieData={pieData}
            barData={barData}
            chartOptions={chartOptions}
          />
        )}

        {/* COURSES LIST */}
        <CourseList
          enrollments={enrollments}
          selectedCourseId={selectedCourseId}
          onToggleCourse={handleToggleCourse}
          materials={materials}
        />

      </div>
    </div>
  );
}