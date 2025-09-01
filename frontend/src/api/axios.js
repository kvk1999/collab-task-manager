// src/api/axios.js
import axios from "axios";

// Use Vite environment variable with a fallback
const API_URL = import.meta.env.VITE_API_URL || "https://collab-task-manager.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
