import { useState, useEffect, createContext, useContext } from "react";
import axiosClient from "../api/axiosClient";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  async function login(email: string, password: string) {
    const res = await axiosClient.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function signup(name: string, email: string, password: string) {
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
