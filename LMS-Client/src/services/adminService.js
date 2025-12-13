import axios from 'axios';

const API_URL = 'http://localhost:4000/api/admin';

// Helper to get token (if not handled by interceptors/cookies automatically)
// Assuming we rely on cookies or headers set globally.
// If using headers manually:
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const getStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getBalances = async () => {
    const response = await axios.get(`${API_URL}/balances`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getPendingCourses = async () => {
    const response = await axios.get(`${API_URL}/courses/pending`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const approveCourse = async (courseId) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/approve`, {}, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const rejectCourse = async (courseId) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/reject`, {}, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/users`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getAllCourses = async () => {
    const response = await axios.get(`${API_URL}/courses/all`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const deleteCourse = async (courseId) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getInstructorDetails = async (profileId) => {
    const response = await axios.get(`${API_URL}/users/instructor/${profileId}`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

const getLearnerDetails = async (profileId) => {
    const response = await axios.get(`${API_URL}/users/learner/${profileId}`, { withCredentials: true, ...getAuthHeaders() });
    return response.data;
};

export default {
    getStats,
    getBalances,
    getPendingCourses,
    approveCourse,
    rejectCourse,
    getAllUsers,
    getAllCourses,
    deleteCourse,
    getInstructorDetails,
    getLearnerDetails,
};
