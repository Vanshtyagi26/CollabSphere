import express from 'express';
import { getMessagesByTeam, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/:teamId').get(protect, getMessagesByTeam);
router.route('/').post(protect, createMessage);
export default router;
