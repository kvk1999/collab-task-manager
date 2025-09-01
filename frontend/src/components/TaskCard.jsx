export default function TaskCard({ task, provided, snapshot, onEdit, onDelete }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-white p-4 rounded shadow mb-3 transition ${snapshot?.isDragging ? "ring-2 ring-blue-400" : ""}`}
    >
      <h3 className="font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => onEdit(task)} className="text-yellow-600">Edit</button>
        <button onClick={() => onDelete(task._id)} className="text-red-600">Delete</button>
      </div>
    </div>
  );
}