import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BankSetupPage from "./pages/BankSetupPage";
import HomePage from "./pages/HomePage";

import LearnerDashboard from "./pages/LearnerDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CourseDetailPage from "./pages/CourseDetailPage";
import EditCoursePage from "./pages/EditCoursePage";
import ProfilePage from "./pages/ProfilePage";

// Wrapper component to use hooks inside router config
function AppWrapper({ element }) {
  const { user } = useAuth();

  return (
    <>
      {typeof element === "function" ? element(user) : element}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

// ROUTER CONFIG
const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AppWrapper
        element={(user) =>
          user ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
    ),
  },
  {
    path: "/register",
    element: (
      <AppWrapper
        element={(user) =>
          user ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />
    ),
  },
  {
    path: "/bank-setup",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute>
            <BankSetupPage />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/course/:id",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/learner-dashboard",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute requireRole="learner">
            <LearnerDashboard />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/instructor-dashboard",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute requireRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute requireRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/instructor/course/:id/edit",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute requireRole="instructor">
            <EditCoursePage />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "/profile",
    element: (
      <AppWrapper
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

// RENDER APP
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
