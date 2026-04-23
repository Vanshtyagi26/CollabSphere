import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    try {
        console.log('[Task Creation API] Received body:', req.body);
        const { title, description, assignedTo, teamId, dueDate, attachments } = req.body;

        if (!title || !teamId) {
            return res.status(400).json({ message: 'Title and Team ID are required' });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo: assignedTo ? assignedTo : null,
            teamId,
            dueDate: dueDate ? dueDate : null,
            attachments: attachments || []
        });

        const io = getIO();
        io.to(`team_${teamId}`).emit('task:created', task);

        if (assignedTo) {
            const notification = await Notification.create({
                recipient: assignedTo,
                type: 'assigned',
                message: `You were assigned a new task: ${title}`,
                relatedTask: task._id
            });
            io.to(`user_${assignedTo}`).emit('notification:received', notification);
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks by team ID
// @route   GET /api/tasks/:teamId
// @access  Private
export const getTasksByTeam = async (req, res) => {
    try {
        const tasks = await Task.find({ teamId: req.params.teamId }).populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:taskId/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.taskId);

        if (task) {
            task.status = status;
            const updatedTask = await task.save();

            getIO().to(`team_${task.teamId}`).emit('task:updated', updatedTask);

            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
