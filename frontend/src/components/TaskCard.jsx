export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded shadow mb-3">
      <h3 className="font-bold text-lg">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      <p className="text-sm mt-1 text-gray-500">Status: {task.status}</p>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={() => onEdit(task)} className="text-blue-500 hover:underline">Edit</button>
        <button onClick={() => onDelete(task.id)} className="text-red-500 hover:underline">Delete</button>
      </div>
    </div>
  );
}
