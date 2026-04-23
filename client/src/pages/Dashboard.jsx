import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Dashboard = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const fetchTeams = async () => {
        try {
            const { data } = await API.get('/teams');
            setTeams(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/teams', { name: newTeamName });
            setNewTeamName('');
            setTeams(prev => [...prev, data]);
        } catch (error) {
            alert('Failed to create team');
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/teams/join', { inviteCode });
            setInviteCode('');
            setTeams(prev => [...prev, data]);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to join team');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
                        <span>Your Teams</span>
                        <span className="bg-blue-100 text-blue-800 text-sm py-1 px-2 rounded-full">{teams.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {teams.map(team => (
                            <Link key={team._id} to={`/team/${team._id}`} className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{team.name}</h3>
                                <p className="text-sm text-gray-500 mt-3 font-medium">{team.members.length} Member{team.members.length > 1 ? 's' : ''}</p>
                            </Link>
                        ))}
                        {teams.length === 0 && (
                            <div className="col-span-1 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                                You are not part of any teams yet. Create or join one!
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <h3 className="font-bold mb-5 text-gray-800 text-lg">Create a Team</h3>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required type="text" placeholder="Team Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                Create New Team
                            </button>
                        </form>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <h3 className="font-bold mb-5 text-gray-800 text-lg">Join a Team</h3>
                        <form onSubmit={handleJoinTeam} className="space-y-4">
                            <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required type="text" placeholder="Enter Invite Code" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800 font-mono tracking-widest uppercase" />
                            <button type="submit" className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold hover:bg-black transition-colors shadow-sm">
                                Join Team
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
