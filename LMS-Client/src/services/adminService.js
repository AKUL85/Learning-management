import axios from 'axios';

const API_URL = '/api/admin';

// Admin service now relies on global axios configuration for baseURL and withCredentials (cookies)

const getStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};

const getBalances = async () => {
    const response = await axios.get(`${API_URL}/balances`);
    return response.data;
};

const getPendingCourses = async () => {
    const response = await axios.get(`${API_URL}/courses/pending`);
    return response.data;
};

const approveCourse = async (courseId) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/approve`, {});
    return response.data;
};

const rejectCourse = async (courseId) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/reject`, {});
    return response.data;
};

const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
};

const getAllCourses = async () => {
    const response = await axios.get(`${API_URL}/courses/all`);
    return response.data;
};

const deleteCourse = async (courseId) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}`);
    return response.data;
};

const getInstructorDetails = async (profileId) => {
    const response = await axios.get(`${API_URL}/users/instructor/${profileId}`);
    return response.data;
};

const getLearnerDetails = async (profileId) => {
    const response = await axios.get(`${API_URL}/users/learner/${profileId}`);
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
