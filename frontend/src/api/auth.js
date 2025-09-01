import axios from "./axios";

// Add /api/auth prefix here
export const loginUser = (data) => axios.post("/api/auth/login", data);
export const signupUser = (data) => axios.post("/api/auth/signup", data);
