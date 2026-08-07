import axios from "axios";

// Extend Axios's request config type so TypeScript knows about our custom
// _authToken field instead of treating it as an error.
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _authToken?: string | null;
  }
}

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

// Attach the JWT to every outgoing request, if one exists. We also stash the
// token on the request config itself so the response interceptor can later
// tell whether THIS specific request's token is still the active session's
// token (see comment below on why that matters).
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config._authToken = token || null;
  return config;
});

// Handle expired/invalid tokens globally — no need to repeat this in every component.
// Dispatches a custom event instead of a hard redirect, so the SPA can navigate
// gracefully (via React Router) rather than forcing a full page reload that would
// wipe any in-memory unsaved state.
//
// Race condition guard: a request sent with an old token (A) can resolve with a
// 401 AFTER the user has already logged out and back in with a new token (B).
// Without checking this, that stale 401 would incorrectly clear the brand new
// session (B). We only treat this as "session expired" if the token this
// specific request was sent with is still the token currently active.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      requestUrl.includes(path)
    );
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const tokenUsedByRequest = error.config?._authToken || null;
      const currentToken = localStorage.getItem("token");
      if (tokenUsedByRequest === currentToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
      // else: this 401 belongs to a stale/older session that's already been
      // replaced — ignore it, the current session is still valid.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
