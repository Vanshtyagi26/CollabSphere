import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Team from './models/Team.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('Authentication Error: No Token'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('Authentication Error: User Not Found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication Error: Invalid Token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`[Socket] Connected: ${socket.id} - ${socket.user.name}`);

        // Structured Personal Room
        socket.join(`user_${socket.user._id}`);

        // Structured Team Rooms
        const userTeams = await Team.find({ 'members.user': socket.user._id });
        userTeams.forEach(team => {
            socket.join(`team_${team._id}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};
