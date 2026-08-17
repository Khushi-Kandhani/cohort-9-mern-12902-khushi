import { useState, useEffect, createContext, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { connectSocket, disconnectSocket } from "../socket";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

interface SignupResponse {
  data: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
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
        connectSocket();
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
      disconnectSocket();
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  async function login(email: string, password: string): Promise<User> {
    try {
      const res = await axiosClient.post<LoginResponse>("/auth/login", { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      connectSocket();
      return user;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }

  async function signup(name: string, email: string, password: string): Promise<User> {
    try {
      const res = await axiosClient.post<SignupResponse>("/auth/signup", { name, email, password });
      return res.data.data;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  }

  async function logout(): Promise<void> {
    try {
      await axiosClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed, clearing local session anyway:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      disconnectSocket();
    }
  }

  const value = { user, isLoading, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
