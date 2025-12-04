import { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";

// 🔥 FIX: Always call backend at http://localhost:4000
axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.withCredentials = true;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);

      if (res.data.user) {
        const profileRes = await axios.get(`/api/profile/${res.data.user._id}`);
        setProfile(profileRes.data.profile);
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser().finally(() => setLoading(false));
  }, []);

  // Sign Up
  const signUp = async (email, password, fullName, role) => {
    const res = await axios.post("/api/auth/signup", {
      email,
      password,
      fullName,
      role
    });

    setUser(res.data.user);

    const profileRes = await axios.get(`/api/profile/${res.data.user._id}`);
    setProfile(profileRes.data.profile);
  };

  // Sign In
  const signIn = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    setUser(res.data.user);

    const profileRes = await axios.get(`/api/profile/${res.data.user._id}`);
    setProfile(profileRes.data.profile);
  };

  // Sign Out
  const signOut = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
    setProfile(null);
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error("No user logged in");

    const res = await axios.put(`/api/profile/${user._id}`, updates);
    setProfile(res.data.profile);
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (!user) return;
    const profileRes = await axios.get(`/api/profile/${user._id}`);
    setProfile(profileRes.data.profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
