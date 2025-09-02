// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import TaskCard from "../components/TaskCard";
import { connectSocket, disconnectSocket, getSocket } from "../socket";

const STATUSES = ["To Do", "In Progress", "Done"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "To Do" });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search/filter
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const debounceRef = useRef(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error("Fetch tasks error:", err.response?.data || err.message);
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Connect socket + listeners
  useEffect(() => {
    fetchTasks();
    const token = localStorage.getItem("token");
    const socket = connectSocket(token);
    if (!socket) return;

    socket.on("task:created", (task) => setTasks((prev) => (prev.some((p) => p._id === task._id) ? prev : [...prev, task])));
    socket.on("task:updated", (task) => setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t))));
    socket.on("task:deleted", (taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId)));

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      disconnectSocket();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    navigate("/");
  };

  // Create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await createTask(newTask);
      setNewTask({ title: "", description: "", status: "To Do" });
      if (res?.data) setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  // Save edited task
  const handleSaveEdit = async (id) => {
    try {
      const payload = { title: editingTask.title, description: editingTask.description, status: editingTask.status };
      await updateTask(id, payload);
      setEditingTask(null);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...payload } : t)));
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  // Drag & Drop
  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const dragged = tasks.find((t) => t.status === source.droppableId && tasks.indexOf(t) === source.index);
    if (!dragged) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === dragged._id ? { ...t, status: destination.droppableId } : t)));

    try {
      await updateTask(dragged._id, { ...dragged, status: destination.droppableId });
      const socket = getSocket();
      if (socket && socket.connected) socket.emit("task:moved", { id: dragged._id, status: destination.droppableId });
    } catch (err) {
      console.error(err);
      setTasks((prev) => prev.map((t) => (t._id === dragged._id ? { ...t, status: source.droppableId } : t)));
      alert("Failed to move task");
    }
  };

  // Search debounce
  const handleQueryChange = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value), 300);
  };

  // Filtered tasks
  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesQuery = !q || (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [tasks, query, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col items-center p-8 text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search tasks..."
            onChange={(e) => handleQueryChange(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            className="border p-2 rounded"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="All">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded">Logout</button>
        </div>
      </div>

      {/* Create Task */}
      <form onSubmit={handleCreateTask} className="bg-white p-4 rounded shadow mb-6 w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 rounded"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 rounded"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            required
          />
          <select
            className="border p-2 rounded"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Add</button>
        </div>
      </form>

      {/* Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 w-full max-w-6xl justify-center">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-50 rounded p-4 min-h-[300px] shadow w-80 ${snapshot.isDraggingOver ? "ring-2 ring-blue-400" : ""}`}
                >
                  <h3 className="font-bold mb-3 text-gray-700">{status}</h3>
                  {visibleTasks.filter((t) => t.status === status).map((task, index) => (
                    <Draggable draggableId={task._id} index={index} key={task._id}>
                      {(dragProvided, dragSnapshot) =>
                        editingTask?.id === task._id ? (
                          <div className="bg-white p-4 rounded shadow mb-3">
                            <input
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
                              {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                            </select>
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(task._id)} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                              <button onClick={() => setEditingTask(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <TaskCard
                            task={task}
                            provided={dragProvided}
                            snapshot={dragSnapshot}
                            onEdit={(t) => setEditingTask({ ...t, id: t._id })}
                            onDelete={handleDeleteTask}
                          />
                        )
                      }
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading tasks…</p>}
    </div>
  );
}
