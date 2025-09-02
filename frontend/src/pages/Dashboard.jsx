import { useState, useEffect, useMemo, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import TaskCard from "../components/TaskCard";

const STATUSES = ["To Do", "In Progress", "Done"];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "To Do" });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search/filter
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const debounceRef = useRef(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data || []);
    } catch {
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  // Drag & Drop handler
  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    if (sourceStatus === destStatus && source.index === destination.index) return;

    const columnTasks = visibleTasks.filter((t) => t.status === sourceStatus);
    const dragged = columnTasks[source.index];
    if (!dragged) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === dragged._id ? { ...t, status: destStatus } : t))
    );

    try {
      await updateTask(dragged._id, { ...dragged, status: destStatus });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t._id === dragged._id ? { ...t, status: sourceStatus } : t))
      );
      alert("Failed to move task");
    }
  };

  // Debounced search
  const handleQueryChange = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value), 300);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        const res = await updateTask(editingTask._id, newTask);
        if (res?.data) {
          setTasks((prev) =>
            prev.map((t) => (t._id === editingTask._id ? res.data : t))
          );
        }
        setEditingTask(null);
      } else {
        // Create new task
        const res = await createTask(newTask);
        if (res?.data) setTasks((prev) => [...prev, res.data]);
      }
      setNewTask({ title: "", description: "", status: "To Do" });
    } catch {
      alert("Failed to save task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description, status: task.status });
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete task");
    }
  };

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center flex flex-col gap-6"
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/thumb_back/fh260/background/20211031/pngtree-abstract-bg-image_914283.png')",
      }}
    >
      {/* Search + Filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-yellow-300">Dashboard</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            className="px-2 py-1 rounded"
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 rounded"
          >
            <option value="All">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create / Edit Task Form */}
      <form
        onSubmit={handleCreateTask}
        className="bg-white bg-opacity-90 p-4 rounded shadow flex gap-2 flex-wrap"
      >
        <input
          type="text"
          placeholder="Title"
          className="px-2 py-1 rounded border flex-1"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          className="px-2 py-1 rounded border flex-2"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          required
        />
        <select
          className="px-2 py-1 rounded border"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          {editingTask ? "Update Task" : "Add Task"}
        </button>
      </form>

      {/* Task Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 justify-center w-full flex-wrap">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white bg-opacity-80 rounded p-4 min-h-[300px] shadow flex-1"
                >
                  <h3 className="font-bold text-lg mb-2 text-yellow-500">{status}</h3>
                  {visibleTasks
                    .filter((t) => t.status === status)
                    .map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(dragProvided, dragSnapshot) => (
                          <TaskCard
                            task={task}
                            provided={dragProvided}
                            snapshot={dragSnapshot}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                          />
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {loading && <p className="text-white">Loading tasks...</p>}
    </div>
  );
}
