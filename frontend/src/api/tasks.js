import axios from "./axios";

// Fetch all tasks
export const getTasks = () => axios.get("/tasks");

// Create a new task
export const createTask = (task) => axios.post("/tasks", task);

// Update a task
export const updateTask = (id, task) => axios.put(`/tasks/${id}`, task);

// Delete a task
export const deleteTask = (id) => axios.delete(`/tasks/${id}`);
