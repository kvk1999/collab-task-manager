import Task from '../models/taskModel.js';

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.json(tasks);
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ _id: id, user: req.user.id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

export const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const task = new Task({ title, description, status, user: req.user.id });
  await task.save();
  res.status(201).json(task);
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOneAndUpdate(
    { _id: id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
};
