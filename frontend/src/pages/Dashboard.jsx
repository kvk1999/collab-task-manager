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

  // Group tasks by status
  const columns = useMemo(() => {
    const map = { "To Do": [], "In Progress": [], "Done": [] };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  // Derived tasks after search & filter
  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesQuery =
        !q ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [tasks, query, statusFilter]);

  // Fetch tasks
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

    // when new task created by anyone
    socket.on("task:created", (task) => {
      setTasks((prev) => {
        // avoid duplicate
        if (prev.some((p) => p._id === task._id)) return prev;
        return [...prev, task];
      });
    });

    // when task updated
    socket.on("task:updated", (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    // when task deleted
    socket.on("task:deleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    navigate("/");
  };

  // create
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await createTask(newTask);
      // optimistic: server will emit 'task:created' to everyone
      setNewTask({ title: "", description: "", status: "To Do" });
      // if backend doesn't emit, manually append:
      if (res?.data) setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      // server ideally emits task:deleted; but remove locally as fallback
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = { title: editingTask.title, description: editingTask.description, status: editingTask.status };
      await updateTask(id, payload);
      setEditingTask(null);
      // server emits task:updated; else refetch or apply change locally:
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...payload } : t)));
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  // Drag & Drop handler
  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    if (sourceStatus === destStatus && source.index === destination.index) return;

    const dragged = columns[sourceStatus][source.index];
    if (!dragged) return;

    // optimistic update: change status locally
    setTasks((prev) => prev.map((t) => (t._id === dragged._id ? { ...t, status: destStatus } : t)));

    try {
      await updateTask(dragged._id, { ...dragged, status: destStatus });
      // optionally emit client-side event if backend expects it:
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit("task:moved", { id: dragged._id, status: destStatus });
      }
    } catch (err) {
      console.error("Drag update error:", err);
      alert("Failed to move task, reverting.");
      setTasks((prev) => prev.map((t) => (t._id === dragged._id ? { ...t, status: sourceStatus } : t)));
    }
  };

  // Debounced query setter
  const handleQueryChange = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header + search/filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search tasks..."
            onChange={(e) => handleQueryChange(e.target.value)}
            className="border p-2 rounded"
          />
          <select className="border p-2 rounded" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <option value="All">All</option>
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded">Logout</button>
        </div>
      </div>

      {/* Create Task */}
      <form onSubmit={handleCreateTask} className="bg-white p-4 rounded shadow mb-6">
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
          <select className="border p-2 rounded" value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Add</button>
        </div>
      </form>

      {/* Drag & Drop columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-50 rounded p-4 min-h-[300px] shadow ${snapshot.isDraggingOver ? "ring-2 ring-blue-400" : ""}`}
                >
                  <h3 className="font-bold mb-3">{status}</h3>

                  {(visibleTasks.filter(t => t.status === status) || []).map((task, index) => (
                    <Draggable draggableId={task._id} index={index} key={task._id}>
                      {(dragProvided, dragSnapshot) =>
                        editingTask?.id === task._id ? (
                          <div className="bg-white p-4 rounded shadow mb-3">
                            {/* edit form */}
                            <input className="border p-2 w-full mb-2 rounded" value={editingTask.title}
                              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} />
                            <textarea className="border p-2 w-full mb-2 rounded" value={editingTask.description}
                              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} />
                            <select className="border p-2 w-full mb-2 rounded" value={editingTask.status}
                              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}>
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
