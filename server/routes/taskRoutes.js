import express from 'express';
import { createTask, getTasksByTeam, updateTaskStatus } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTask);
router.route('/:teamId').get(protect, getTasksByTeam);
router.route('/:taskId/status').put(protect, updateTaskStatus);

export default router;
