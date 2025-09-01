import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://collab-task-manager.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// Add token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;