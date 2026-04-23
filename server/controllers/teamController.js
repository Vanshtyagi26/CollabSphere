import Team from '../models/Team.js';
import crypto from 'crypto';

// @desc    Get user's teams
// @route   GET /api/teams
// @access  Private
export const getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({ 'members.user': req.user.id }).populate("members.user", "name email");
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const inviteCode = crypto.randomBytes(4).toString('hex');

        const team = await Team.create({
            name,
            createdBy: req.user.id,
            inviteCode,
            members: [{ user: req.user.id, role: 'admin' }],
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join team via invite code
// @route   POST /api/teams/join
// @access  Private
export const joinTeam = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const team = await Team.findOne({ inviteCode });

        if (!team) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        if (team.members.some(m => m.user.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        team.members.push({ user: req.user.id, role: 'member' });
        await team.save();

        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('members.user', 'name email');
        if (team) {
            res.json(team);
        } else {
            res.status(404).json({ message: 'Team not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
