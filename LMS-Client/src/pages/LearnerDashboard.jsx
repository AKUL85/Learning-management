import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

// Component Imports
import Toast from '../components/ui/Toast';
import DashboardLoader from '../components/dashboard/DashboardLoader';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MetricCards from '../components/dashboard/MetricCards';
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

        // Prioritize data from courseProgress, fallback to enriched profile data
        const completionPercentage = courseProgress?.completionPercentage ?? course.progress_percentage ?? 0;
        const isCompleted = courseProgress?.isCompleted ?? course.is_completed ?? (completionPercentage >= 100);
        const status = courseProgress?.status ?? (isCompleted ? 'Completed' : 'In Progress');

        return {
          id: course._id,
          learner_id: profile.user?._id || profile.user,
          course_id: course._id,
          is_completed: !!isCompleted,
          status: status,
          completion_percentage: completionPercentage,
          certificate_url: isCompleted ? `http://localhost:4000/api/progress/${profile.user?._id || profile.user}/${course._id}/certificate` : null,
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
      const mixedMaterials = [];

      // Add downloadable materials
      if (enrollment.fullCourseData.materials) {
        enrollment.fullCourseData.materials.forEach((m, idx) => {
          mixedMaterials.push({
            id: `mat-${idx}`,
            title: `Resource: ${m.title}`,
            content_type: 'text'
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

  // Toggle course expand/materials
  const handleToggleCourse = (courseId) => {
    const newSelectedId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newSelectedId);
    if (newSelectedId) {
      fetchMaterials(newSelectedId);
    }
  };

  const completedCount = enrollments.filter((e) => e.is_completed).length;
  const inProgressCount = enrollments.length - completedCount;

  if (loading) return <DashboardLoader />;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar></Navbar>
      <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">

        {/* HEADER */}
        <DashboardHeader />

        {/* CARDS (Metric Widgets) */}
        <MetricCards
          totalCourses={enrollments.length}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
        />

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