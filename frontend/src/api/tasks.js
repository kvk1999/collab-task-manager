import axios from "./axios";

// Get all tasks
export const getTasks = () => axios.get("/api/tasks");

// Create a new task
export const createTask = (data) => axios.post("/api/tasks", data);

// Update a task
export const updateTask = (id, data) => axios.put(`/api/tasks/${id}`, data);

// Delete a task
export const deleteTask = (id) => axios.delete(`/api/tasks/${id}`);
