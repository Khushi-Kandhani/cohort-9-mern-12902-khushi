import axios from "axios";

// Auth endpoints where a 401 means "wrong credentials", not "session expired" —
// these should NOT trigger a global logout/redirect.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup"];
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // fail fast instead of hanging forever on a slow/dead backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request, if one exists
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid tokens globally — no need to repeat this in every component
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      requestUrl.includes(path)
    );

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
