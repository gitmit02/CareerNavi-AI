import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "careernavi-token";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 45000, // AI endpoints can take a while
});

// Attach JWT to every outgoing request, if present
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so the UI never has to read raw Axios/Backend error shapes
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    let message = backendMessage || "Something went wrong. Please try again.";
    if (!error.response) {
      message = "Can't reach the server. Check your connection and try again.";
    }

    if (status === 401) {
      // Token missing/expired/invalid - force re-login
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("careernavi-user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message });
  }
);

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
export default axiosClient;
