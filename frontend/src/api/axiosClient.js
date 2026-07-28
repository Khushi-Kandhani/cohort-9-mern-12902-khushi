import axios from "axios";

// Auth endpoints where a 401 means "wrong credentials" or "already logged out" —
// not "session expired" — so they should NOT trigger a global logout/redirect.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/logout"];

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

// Handle expired/invalid tokens globally — no need to repeat this in every component.
// Dispatches a custom event instead of a hard redirect, so the SPA can navigate
// gracefully (via React Router) rather than forcing a full page reload that would
// wipe any in-memory unsaved state.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      requestUrl.includes(path)
    );

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
