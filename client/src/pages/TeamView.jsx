import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const TeamView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const socket = useSocket();
    const [team, setTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // New Task state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Chat input
    const [chatInput, setChatInput] = useState('');

    // UI state
    const [copied, setCopied] = useState(false);
    const chatEndRef = useRef(null);

    const handleCopyInvite = () => {
        if (team && team.inviteCode) {
            navigator.clipboard.writeText(team.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [teamRes, tasksRes, msgRes] = await Promise.all([
                API.get(`/teams/${id}`),
                API.get(`/tasks/${id}`),
                API.get(`/messages/${id}`)
            ]);
            setTeam(teamRes.data);
            setTasks(tasksRes.data);
            setMessages(msgRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.response?.data?.message || 'Failed to fetch team data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        if (!socket) return;

        const handleTaskCreated = (newTask) => {
            if (newTask.teamId === id) {
                setTasks(prev => prev.find(t => t._id === newTask._id) ? prev : [...prev, newTask]);
            }
        };

        const handleTaskUpdated = (updatedTask) => {
            if (updatedTask.teamId === id) {
                setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            }
        };

        const handleMessage = (msg) => {
            if (msg.teamId === id) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('message:received', handleMessage);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('message:received', handleMessage);
        };
    }, [id, socket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            let attachments = [];

            // Upload file if selected
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await API.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                attachments.push(uploadRes.data);
            }

            const payload = { title, description, assignedTo, teamId: id, dueDate, attachments };
            console.log('[Frontend] Sending task payload:', payload);

            const { data } = await API.post('/tasks', payload);
            console.log('[Frontend] Task created successfully:', data);

            setTitle(''); setDescription(''); setAssignedTo(''); setDueDate(''); setFile(null);
            setTasks(prev => prev.find(t => t._id === data._id) ? prev : [...prev, data]);
        } catch (error) {
            console.error('[Frontend] Task Creation Error:', error);
            alert(error.response?.data?.message || 'Failed to create task');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateStatus = async (taskId, status) => {
        try {
            const { data } = await API.put(`/tasks/${taskId}/status`, { status });
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: data.status } : t));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        try {
            const { data } = await API.post('/messages', { text: chatInput, teamId: id });
            setChatInput('');
            setMessages(prev => prev.find(m => m._id === data._id) ? prev : [...prev, data]);
        } catch (error) {
            console.error('Failed to send msg', error);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Loading team details...</div>;
    if (error) return <div className="flex h-screen items-center justify-center font-bold text-red-500">{error}</div>;
    if (!team) return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Team not found.</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 flex flex-col xl:flex-row gap-8">
            {/* Sidebar with Team Info */}
            <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <Link to="/" className="inline-block px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{team.name}</h2>
                    <div className="mt-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Invite Code</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="font-mono text-xl font-bold tracking-widest text-blue-600 select-all">{team.inviteCode}</p>
                            <button onClick={handleCopyInvite} className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-1 px-3 rounded transition-colors focus:outline-none">
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Chat Panel Box inside Sidebar */}
                    <h3 className="font-bold mt-8 mb-4 text-gray-800 border-b pb-2">Team Chat</h3>
                    <div className="flex flex-col h-72">
                        <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-100 p-3 rounded-xl space-y-3 shadow-inner">
                            {messages.map(m => (
                                <div key={m._id} className={`max-w-[85%] p-3 rounded-xl text-[13px] ${m.sender._id === user._id ? 'bg-blue-600 text-white self-end ml-auto rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 self-start mr-auto rounded-bl-sm shadow-sm'}`}>
                                    {m.sender._id !== user._id && <p className="text-[10px] font-bold text-gray-400 mb-1 leading-none">{m.sender.name}</p>}
                                    <p className="leading-snug">{m.text}</p>
                                </div>
                            ))}
                            {messages.length === 0 && <p className="text-center text-xs text-gray-400 italic py-6">No messages yet.</p>}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendChat} className="mt-3 flex space-x-2">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} type="text" placeholder="Type a message..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition">Send</button>
                        </form>
                    </div>
                </div>

                {/* Create Task Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-5 text-gray-800">Create New Task</h3>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Task Title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"></textarea>

                        <div className="space-y-4">
                            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm">
                                <option value="">Assign To...</option>
                                {team.members.map(m => (
                                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                                ))}
                            </select>
                            <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />

                            <label className="block border border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-xs text-gray-500 font-medium">
                                    {file ? file.name : '+ Attach File (Image/PDF)'}
                                </span>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*,.pdf" />
                            </label>
                        </div>
                        <button disabled={isUploading} type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors mt-2 disabled:bg-gray-400">
                            {isUploading ? 'Uploading...' : 'Add Task'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Task Board */}
            <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <header className="border-b border-gray-100 pb-5 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Task Board</h3>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {['To Do', 'In Progress', 'Done'].map(status => (
                        <div key={status} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-5">
                                <h4 className="font-bold text-gray-800">{status}</h4>
                                <span className="bg-white text-gray-500 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>
                            <div className="space-y-4 min-h-[100px]">
                                {tasks.filter(t => t.status === status).map(task => (
                                    <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group cursor-default">
                                        <h5 className="font-bold text-gray-900 leading-tight mb-2">{task.title}</h5>
                                        {task.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{task.description}</p>}

                                        {task.attachments && task.attachments.length > 0 && (
                                            <div className="mb-4">
                                                <a href={task.attachments[0].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                                    📎 {task.attachments[0].title || 'Attachment'}
                                                </a>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                                                    {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">
                                                    {task.assignedTo ? task.assignedTo.name.split(' ')[0] : 'Unassigned'}
                                                </span>
                                            </div>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                                                className="bg-gray-100 hover:bg-gray-200 border-none rounded-lg py-1 pr-8 pl-3 text-xs font-bold focus:ring-0 cursor-pointer transition-colors text-gray-700 h-8"
                                            >
                                                <option value="To Do">To Do</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === status).length === 0 && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs font-medium text-gray-400">Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamView;
