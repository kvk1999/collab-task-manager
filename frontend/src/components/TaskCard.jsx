export default function TaskCard({ task, provided, snapshot, onEdit, onDelete }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`p-3 mb-2 rounded shadow bg-black bg-opacity-70 text-yellow-300 transition 
        ${snapshot.isDragging ? "border-2 border-yellow-400" : ""}`}
    >
      <h4 className="font-bold">{task.title}</h4>
      <p className="text-sm mb-2">{task.description}</p>
      <div className="flex justify-between text-xs">
        <button
          onClick={() => onEdit(task)}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
