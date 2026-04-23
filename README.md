# CollabSphere

Phase 1 MVP of a scalable Team Collaboration Platform built with the MERN stack.

## Features
- **Authentication**: JWT, proper error handling, bcrypt protection.
- **Team Management**: Create teams, join using invite codes.
- **Task Management**: Create tasks, assign to members, Kanban-style status board.
- **UI**: Modern, responsive interface using React, TailwindCSS v4, Vite.

## Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB installed locally or via cloud cluster

### 1. Backend Server Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Make sure MongoDB is running locally.
4. Your `.env` variables have already been created with defaults.
5. Start development server: `npm run dev` (starts on `http://localhost:5000` via nodemon via package.json?) Wait, we need to make sure you have the dev script since Node 22/nodemon is used.
Wait, you can simply run `node server.js` or `npx nodemon server.js`.

### 2. Frontend Client Setup
1. Navigate to the `client` directory in a new terminal: `cd client`
2. Install dependencies (if not done): `npm install`
3. Run development server: `npm run dev`

You can now navigate to the displayed localhost URL (usually `http://localhost:5173`) and test the platform by registering a user and creating/joining a team.

## API Structure
- `/api/auth` - Login, Register
- `/api/users/me` - Profile fetching
- `/api/teams` - Create, Join, List User's Teams, Get Specific Team
- `/api/tasks` - Create, List by Team, Update Status
