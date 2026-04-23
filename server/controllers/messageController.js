import Message from '../models/Message.js';
import { getIO } from '../socket.js';

export const getMessagesByTeam = async (req, res) => {
    try {
        const messages = await Message.find({ teamId: req.params.teamId }).populate('sender', 'name');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createMessage = async (req, res) => {
    try {
        const { text, teamId } = req.body;
        const message = await Message.create({ sender: req.user._id, teamId, text });
        const populatedMessage = await message.populate('sender', 'name');

        getIO().to(`team_${teamId}`).emit('message:received', populatedMessage);
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
