import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "'To Do', 'In Progress', 'Done'" });
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await getTasks({ headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await createTask(newTask, { headers: { Authorization: `Bearer ${token}` } });
      setNewTask({ title: "", description: "", status: "To Do" });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await updateTask(id, editingTask, { headers: { Authorization: `Bearer ${token}` } });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await deleteTask(id, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full mb-3 rounded"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full mb-3 rounded"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          required
        />
        <select
          className="border p-2 w-full mb-3 rounded"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-4 rounded shadow">
            {editingTask?.id === task._id ? (
              <>
                <input
                  type="text"
                  className="border p-2 w-full mb-2 rounded"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
                <textarea
                  className="border p-2 w-full mb-2 rounded"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
                <select
                  className="border p-2 w-full mb-2 rounded"
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
                <button
                  onClick={() => handleUpdateTask(task._id)}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="bg-gray-400 text-white py-1 px-3 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <span className="inline-block bg-gray-200 text-xs px-2 py-1 rounded mt-2">
                  {task.status}
                </span>
                <div className="mt-3">
                  <button
                    onClick={() => setEditingTask({ ...task, id: task._id })}
                    className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
