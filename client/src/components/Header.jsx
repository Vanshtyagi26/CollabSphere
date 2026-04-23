import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notif) => {
            setNotifications(prev => [notif, ...prev]);
        };

        socket.on('notification:received', handleNotification);

        return () => {
            socket.off('notification:received', handleNotification);
        };
    }, [socket]);

    if (!user) return null;

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-6 shrink-0 flex justify-between items-center z-50 sticky top-0">
            <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">CollabSphere</Link>

            <div className="flex items-center space-x-6">
                <div className="relative">
                    <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors focus:outline-none">
                        <span className="text-2xl">🔔</span>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">Notifications ({notifications.filter(n => !n.isRead).length})</div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-sm font-medium text-gray-400">No new notifications</div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className={`p-4 border-b border-gray-50 text-sm hover:bg-gray-50 transition-colors ${n.isRead ? 'opacity-60' : 'bg-blue-50/20'}`}>
                                            <p className="text-gray-800 font-medium">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                    <span className="font-bold text-gray-900 tracking-tight">{user.name}</span>
                    <button onClick={logout} className="text-sm bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-lg transition-colors border border-red-100">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
