import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../api/tasks";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {["To Do", "In Progress", "Done"].map((status) => (
        <div key={status} className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-3">{status}</h2>
          {tasks
            .filter((t) => t.status === status)
            .map((task) => (
              <TaskCard key={task.id} task={task} onDelete={handleDelete} />
            ))}
        </div>
      ))}
    </div>
  );
}

