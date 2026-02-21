import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import Toast from '../components/ui/Toast';

// Component Imports
import InstructorHeader from '../components/dashboard/InstructorHeader';
import InstructorStats from '../components/dashboard/InstructorStats';
import InstructorCharts from '../components/dashboard/InstructorCharts';
import PendingTransactions from '../components/dashboard/PendingTransactions';
import InstructorCourseList from '../components/dashboard/InstructorCourseList';
import CreateCourseModal from '../components/dashboard/CreateCourseModal';
import InstructorDashboardLoader from '../components/dashboard/InstructorDashboardLoader';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Toast hook (extracted here locally or could be in useToast hook file, but keeping simple as per plan)
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
  const { profile, refreshProfile } = useAuth();
  const { toast, showToast, setToastState } = useToast();
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    video: null,
    materials: [],
    mcqs: [],
    cqs: []
  });

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
      if (data.profile && refreshProfile) refreshProfile(data.profile);
    } catch (err) {
      console.error(err);
      showToast('Error: Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function createCourse() {
    if (!profile || !newCourse.title || !newCourse.description || !newCourse.price || !newCourse.image || !newCourse.video) {
      showToast('Error: Please fill in all required fields.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newCourse.title);
      formData.append("description", newCourse.description);
      formData.append("price", newCourse.price);
      formData.append("image", newCourse.image);
      formData.append("video", newCourse.video);
      newCourse.materials.forEach((file) => {
        formData.append("materials", file);
      });

      const validMCQs = newCourse.mcqs.filter(m =>
        m.question.trim() !== "" &&
        m.options.every(o => o.trim() !== "")
      );

      const validCQs = newCourse.cqs.filter(c =>
        c.question.trim() !== "" &&
        c.answer.trim() !== ""
      );

      formData.append("mcqs", JSON.stringify(validMCQs));
      formData.append("cqs", JSON.stringify(validCQs));

      console.log("Sending FormData with:", newCourse);

      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (!res.ok) throw new Error(responseText || `Failed to create course: ${res.status}`);
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || `Failed to create course: ${res.status}`);
      }

      await Swal.fire({
        title: 'Course Created!',
        text: 'Your course has been submitted successfully and is now pending approval. You have been rewarded $500.00!',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#06b6d4',
        timer: 3000,
        timerProgressBar: true
      });

      setShowCreateModal(false);
      setNewCourse({
        title: "",
        description: "",
        price: "",
        image: null,
        video: null,
        materials: [],
        mcqs: [],
        cqs: []
      });

      fetchData();

    } catch (err) {
      console.error("Course creation error:", err);
      Swal.fire({
        title: 'Creation Failed',
        text: err.message || "Error: Failed to create the new course.",
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
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
      showToast('Error: Failed to validate the transaction.', 'error');
    }
  }

  async function handleDeleteCourse(courseId) {
    const result = await Swal.fire({
      title: 'Delete Course?',
      text: "This action cannot be undone. This course will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to delete course');

        await Swal.fire({
          title: 'Deleted!',
          text: 'Course deleted successfully.',
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false
        });

        setCourses(courses.filter(c => c._id !== courseId));
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete protocol.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff'
        });
      }
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
        label: 'Course Price ($)',
        data: courses.map((c) => c.price),
        borderRadius: 8,
      },
    ],
  };

  const transactionData = {
    labels: ['Course Rewards', 'Student Enrollments', 'Total Revenue'],
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

  if (loading) return <InstructorDashboardLoader />;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Toast {...toast} onClose={() => setToastState(prev => ({ ...prev, isVisible: false }))} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">

        {/* HEADER */}
        <InstructorHeader onOpenCreateModal={() => setShowCreateModal(true)} />

        {/* METRIC CARDS */}
        <InstructorStats
          totalCourses={courses.length}
          totalEarnings={totalEarnings}
          pendingTransactionsCount={pendingTransactions.length}
          pendingCoursesCount={courses.filter(c => c.status === 'pending').length}
          totalAudience={transactions.filter((t) => t.type === 'course_purchase').length}
        />

        {/* CHARTS */}
        <InstructorCharts
          earningsData={earningsData}
          transactionData={transactionData}
          chartOptions={chartOptions}
        />

        {/* PENDING TRANSACTIONS */}
        {pendingTransactions.length > 0 && (
          <PendingTransactions
            transactions={pendingTransactions}
            onValidate={validateTransaction}
          />
        )}

        {/* COURSE LIST */}
        <InstructorCourseList
          courses={courses}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onDelete={handleDeleteCourse}
        />
      </div>

      {/* CREATE MODAL */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        onSubmit={createCourse}
      />

    </div>
  );
}