import express from 'express';
import { createTeam, joinTeam, getTeamById, getMyTeams } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTeam).get(protect, getMyTeams);
router.route('/join').post(protect, joinTeam);
router.route('/:id').get(protect, getTeamById);

export default router;
