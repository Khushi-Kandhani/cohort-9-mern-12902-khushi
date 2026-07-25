import { useState, useEffect } from "react";
import { createContext, useContext } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Corrupted user data in localStorage, clearing session:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // axiosClient dispatches this on a 401 from a non-auth endpoint (expired/invalid
  // token). localStorage is already cleared there — this makes sure React's own
  // auth state (and anything reading it, like ProtectedRoute) reflects that too.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  async function login(email, password) {
    const res = await axiosClient.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function signup(name, email, password) {
    const res = await axiosClient.post("/auth/signup", { name, email, password });
    return res.data.data;
  }

  async function logout() {
    try {
      await axiosClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed, clearing local session anyway:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }

  const value = { user, isLoading, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
