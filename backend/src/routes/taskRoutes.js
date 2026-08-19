import express from 'express';
import {
  getTasks,
  getAnalytics,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../controllers/taskController.js';
import { taskRules, taskQueryRules } from '../middleware/validators.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require a valid JWT.
router.use(protect);

// IMPORTANT: /analytics must be declared before the /:id routes,
// otherwise Express will try to match "analytics" as an :id value.
router.get('/analytics', getAnalytics);

router.get('/', taskQueryRules, getTasks);
router.post('/', taskRules, createTask);
router.get('/:id', getTask);
router.put('/:id', taskRules, updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;
