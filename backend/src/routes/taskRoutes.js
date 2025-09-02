import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

router.get('/', getTasks);           // GET all tasks
router.get('/:id', getTaskById);     // GET single task
router.post('/', createTask);        // CREATE new task
router.put('/:id', updateTask);      // UPDATE task
router.delete('/:id', deleteTask);   // DELETE task

export default router;
