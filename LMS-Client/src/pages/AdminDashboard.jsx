import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import 'animate.css';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    Wallet,
    AlertCircle,
    CheckCircle,
    XCircle,
    Trash2,
    Search,
    TrendingUp,
    DollarSign,
    UserCheck,
    X,
    Eye
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsData = await adminService.getStats();
            const balancesData = await adminService.getBalances();
            const pendingData = await adminService.getPendingCourses();
            const allCoursesData = await adminService.getAllCourses();
            const usersData = await adminService.getAllUsers();

            setStats(statsData);
            setBalances(balancesData);
            setPendingCourses(pendingData);
            setAllCourses(allCoursesData);
            setUsers(usersData);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch admin data. ensure you are an admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (courseId) => {
        const result = await Swal.fire({
            title: 'Approve Course?',
            text: "Payment will be released to the instructor.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve!',
            background: '#1f2937',
            color: '#fff',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });

        if (result.isConfirmed) {
            try {
                await adminService.approveCourse(courseId);
                await Swal.fire({
                    title: 'Approved!',
                    text: 'The course is now live.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff',
                    confirmButtonColor: '#3B82F6'
                });
                fetchData();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.message || 'Error approving course',
                    icon: 'error',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    };

    const handleReject = async (courseId) => {
        const result = await Swal.fire({
            title: 'Reject Course?',
            text: "The instructor will need to resubmit.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Reject',
            background: '#1f2937',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await adminService.rejectCourse(courseId);
                await Swal.fire({
                    title: 'Rejected',
                    text: 'Course has been rejected.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
                fetchData();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: 'Error rejecting course',
                    icon: 'error',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const result = await Swal.fire({
            title: 'Delete Course?',
            text: "You won't be able to revert this! Ensure you have verified removal.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            background: '#1f2937',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await adminService.deleteCourse(courseId);
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Course has been deleted.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#fff'
                });
                fetchData();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: 'Error deleting course',
                    icon: 'error',
                    background: '#1f2937',
                    color: '#fff'
                });
            }
        }
    };

    const handleInspectUser = async (user) => {
        setSelectedUser(user);
        setLoadingDetail(true);
        try {
            let detail;
            if (user.role === 'instructor') {
                detail = await adminService.getInstructorDetails(user._id);
            } else if (user.role === 'learner') {
                detail = await adminService.getLearnerDetails(user._id);
            }
            setUserDetail(detail);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch user details');
            setSelectedUser(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setUserDetail(null);
    };

    if (loading) return <LoadingSpinner message="Loading Admin Command Center..." showNavbar={false} />;

    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    const instructors = users.filter(u => u.role === 'instructor');
    const learners = users.filter(u => u.role === 'learner');
    const activeCoursesList = allCourses.filter(c => c.status === 'approved');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'instructors', label: 'Instructors', icon: Users },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'financials', label: 'Financials', icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-[#0F172A] text-white relative overflow-hidden">
            <Navbar />
            <div className="p-6 pt-24 max-w-7xl mx-auto relative z-10">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 text-lg">System Overview & Management</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${activeTab === tab.id
                                ? 'text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/50 rounded-xl backdrop-blur-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className="w-5 h-5 relative z-10" />
                            <span className="font-medium relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl min-h-[500px]"
                    >

                        {/* Overview Tab */}
                        {activeTab === 'overview' && stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                <StatCard title="Total Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} icon={DollarSign} color="green" />
                                <StatCard title="Instructor Earnings" value={`$${stats.instructorEarnings?.toFixed(2)}`} icon={TrendingUp} color="orange" />
                                <StatCard title="Total Purchases" value={stats.purchaseCount} icon={Wallet} color="blue" />
                                <StatCard title="Instructors" value={stats.totalInstructors} icon={Users} color="purple" />
                                <StatCard title="Active Courses" value={activeCoursesList.length} icon={BookOpen} color="cyan" />
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === 'courses' && (
                            <div className="space-y-10">
                                {/* Pending List */}
                                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-6 text-yellow-400 flex items-center">
                                        <AlertCircle className="w-6 h-6 mr-2" />
                                        Pending Approvals ({pendingCourses.length})
                                    </h2>
                                    {pendingCourses.length === 0 ? (
                                        <p className="text-gray-500 italic">All courses reviewed.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingCourses.map(course => (
                                                <div key={course._id} className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-yellow-500/50 transition-colors">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white">{course.title}</h3>
                                                        <div className="flex space-x-4 text-sm text-gray-400 mt-1">
                                                            <span>By: {course.instructor_id?.fullName || 'Unknown'}</span>
                                                            <span className="text-blue-400 font-mono">${course.price}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => navigate(`/course/${course._id}`)}
                                                            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/30"
                                                            title="View Content"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>View</span>
                                                        </button>
                                                        <ActionBtn onClick={() => handleApprove(course._id)} color="green" icon={CheckCircle}>Approve</ActionBtn>
                                                        <ActionBtn onClick={() => handleReject(course._id)} color="red" icon={XCircle}>Reject</ActionBtn>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* All Courses List */}
                                <div>
                                    <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center">
                                        <BookOpen className="w-6 h-6 mr-2" />
                                        Course Catalog
                                    </h2>
                                    <div className="bg-gray-800/40 rounded-2xl overflow-hidden border border-gray-700">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-800/80 text-gray-400 border-b border-gray-700">
                                                <tr>
                                                    <th className="p-4 font-medium">Course Title</th>
                                                    <th className="p-4 font-medium">Instructor</th>
                                                    <th className="p-4 font-medium">Status</th>
                                                    <th className="p-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50">
                                                {allCourses.length === 0 ? (
                                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No courses found.</td></tr>
                                                ) : allCourses.map(course => (
                                                    <tr key={course._id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-4 font-medium text-white">{course.title}</td>
                                                        <td className="p-4 text-gray-300">{course.instructor_id?.fullName || 'Unknown'}</td>
                                                        <td className="p-4">
                                                            <StatusBadge status={course.status} />
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => navigate(`/course/${course._id}`)}
                                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                                                title="View Course"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCourse(course._id)}
                                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                                title="Delete Course"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructors Tab */}
                        {activeTab === 'instructors' && (
                            <UserTable
                                users={instructors}
                                onInspect={handleInspectUser}
                                roleName="Instructor"
                                icon={Users}
                            />
                        )}

                        {/* Students Tab */}
                        {activeTab === 'students' && (
                            <UserTable
                                users={learners}
                                onInspect={handleInspectUser}
                                roleName="Student"
                                icon={GraduationCap}
                            />
                        )}

                        {/* Financials Tab */}
                        {activeTab === 'financials' && balances && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-3">
                                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 p-8 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-green-400 font-medium mb-1">System Balance (Admin)</p>
                                            <p className="text-5xl font-bold text-white font-mono tracking-tighter">
                                                ${balances.systemBalance?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-green-500/20 p-4 rounded-full">
                                            <Wallet className="w-12 h-12 text-green-400" />
                                        </div>
                                    </div>
                                </div>

                                <BalanceList title="Instructor Balances" users={balances.instructors} color="blue" />
                                <BalanceList title="Learner Balances" users={balances.learners} color="orange" />
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Inspection Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1E293B] border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-600/20 rounded-lg">
                                        <UserCheck className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white leading-none">{selectedUser.fullName}</h2>
                                        <span className="text-xs text-blue-400 font-mono mt-1 block uppercase tracking-wider">{selectedUser.role}</span>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-white transition">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto">
                                {loadingDetail ? (
                                    <div className="py-12 flex justify-center">
                                        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : userDetail ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailCard label="Email" value={userDetail.profile.user?.email || 'N/A'} />
                                            <DetailCard label="Wallet Balance" value={`$${userDetail.profile.bankBalance?.toFixed(2)}`} highlight />
                                        </div>

                                        {selectedUser.role === 'instructor' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                                        <p className="text-xs text-blue-400 uppercase tracking-wide">Total Earnings</p>
                                                        <p className="text-2xl font-bold text-white mt-1">${userDetail.totalEarnings?.toFixed(2)}</p>
                                                    </div>
                                                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                                                        <p className="text-xs text-purple-400 uppercase tracking-wide">Total Students</p>
                                                        <p className="text-2xl font-bold text-white mt-1">{userDetail.studentsCount}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold mb-4 flex items-center">
                                                        <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
                                                        Courses ({userDetail.courses.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {userDetail.courses.map(c => (
                                                            <div key={c._id} className="bg-gray-700/30 p-4 rounded-xl flex justify-between items-center border border-gray-700/50">
                                                                <span className="font-medium">{c.title}</span>
                                                                <StatusBadge status={c.status} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedUser.role === 'learner' && (
                                            <div>
                                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                                    <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
                                                    Enrolled Courses
                                                </h3>
                                                <div className="space-y-4">
                                                    {userDetail.enrolledCourses.length === 0 ? (
                                                        <p className="text-gray-500">No enrollments.</p>
                                                    ) : userDetail.enrolledCourses.map(c => (
                                                        <div key={c._id} className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="font-medium">{c.title}</span>
                                                                <span className="text-sm font-mono text-blue-400">{c.progressPercent}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                                                    style={{ width: `${c.progressPercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-red-400 text-center">Failed to load user details.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border backdrop-blur-sm ${colors[color]} shadow-lg`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-white/5`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </motion.div>
    );
};

const UserTable = ({ users, onInspect, roleName, icon: Icon }) => (
    <div>
        <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <Icon className="w-6 h-6 mr-2 text-blue-400" />
            {roleName} Directory
        </h2>
        <div className="bg-gray-800/40 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
            <table className="w-full text-left">
                <thead className="bg-gray-800/80 text-gray-400 border-b border-gray-700">
                    <tr>
                        <th className="p-4 font-medium">Full Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Balance</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                    {users.map(user => (
                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-medium text-white">{user.fullName}</td>
                            <td className="p-4 text-gray-300">{user.user?.email || 'N/A'}</td>
                            <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-gray-300 group-hover:text-green-400 transition-colors">
                                ${user.bankBalance?.toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => onInspect(user)}
                                    className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No {roleName.toLowerCase()}s found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const BalanceList = ({ title, users, color }) => {
    const colors = {
        blue: 'text-blue-400',
        orange: 'text-orange-400'
    };
    return (
        <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-2xl">
            <h3 className={`text-lg font-bold mb-4 ${colors[color]}`}>{title}</h3>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {users.map(user => (
                    <div key={user._id} className="flex justify-between items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                        <span className="text-gray-300 text-sm">{user.fullName}</span>
                        <span className="font-mono font-bold text-white">${user.bankBalance?.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        approved: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {status}
        </span>
    );
};

const ActionBtn = ({ children, onClick, color, icon: Icon }) => {
    const styles = {
        green: 'bg-green-600 hover:bg-green-500 text-white',
        red: 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30',
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${styles[color]}`}
        >
            <Icon className="w-4 h-4" />
            <span>{children}</span>
        </button>
    );
};

const DetailCard = ({ label, value, highlight }) => (
    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-lg font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
);

export default AdminDashboard;
