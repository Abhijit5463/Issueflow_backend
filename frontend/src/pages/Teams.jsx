import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Users, UserPlus, Trash2, Check, X, Plus } from 'lucide-react';

export default function Teams() {
    const { api, user } = useContext(AuthContext);
    const [myTeams, setMyTeams] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [invitationEmail, setInvitationEmail] = useState({});
    const [teamMembers, setTeamMembers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, invitesRes] = await Promise.all([
                api.get('teams/my'),
                api.get('invitations')
            ]);
            setMyTeams(teamsRes.data);
            setInvitations(invitesRes.data.filter(inv => inv.status === 'PENDING'));

            // Fetch members for each team
            const membersPromises = teamsRes.data.map(team => api.get(`teams/${team.id}/members`));
            const membersResults = await Promise.all(membersPromises);
            const membersMap = {};
            teamsRes.data.forEach((team, index) => {
                membersMap[team.id] = membersResults[index].data;
            });
            setTeamMembers(membersMap);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            const message = err.response?.data?.message || err.message || 'Failed to fetch teams or invitations';
            setError(message);
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await api.post('teams', { name: newTeamName });
            setNewTeamName('');
            fetchData();
        } catch (err) {
            console.error("Error creating team:", err);
            const message = err.response?.data?.message || err.message || 'Failed to create team';
            setError(message);
        }
    };

    const handleInvite = async (teamId) => {
        try {
            await api.post(`teams/${teamId}/invite`, { email: invitationEmail[teamId] });
            setInvitationEmail({ ...invitationEmail, [teamId]: '' });
            alert('Invitation sent!');
        } catch (err) {
            setError('Failed to send invitation');
        }
    };

    const handleRemoveMember = async (teamId, userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`teams/${teamId}/members/${userId}`);
            fetchData();
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    const handleRespondInvitation = async (invitationId, status) => {
        try {
            await api.post(`invitations/${invitationId}/respond`, { status });
            fetchData();
        } catch (err) {
            setError('Failed to respond to invitation');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px' }}>
                <span style={{ color: '#818cf8' }}>Team</span> <span style={{ color: '#e2e8f0' }}>Management</span>
            </h1>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <div className="card" style={{ marginBottom: '30px', border: '1px solid #818cf8' }}>
                    <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <UserPlus size={20} color="#818cf8" /> Pending Invitations
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {invitations.map(inv => (
                            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#1e293b', borderRadius: '8px' }}>
                                <div>
                                    <span style={{ fontWeight: '600' }}>{inv.team.name}</span>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Invited by: {inv.inviter.name}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleRespondInvitation(inv.id, 'ACCEPTED')} className="btn" style={{ background: '#22c55e', padding: '8px 12px' }} title="Accept">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => handleRespondInvitation(inv.id, 'DECLINED')} className="btn" style={{ background: '#ef4444', padding: '8px 12px' }} title="Decline">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Team Section */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Plus size={20} color="#818cf8" /> Create New Team
                </h2>
                <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Team Name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        Create Team
                    </button>
                </form>
            </div>

            {/* My Teams Section */}
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>My Teams</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {myTeams.map(team => (
                    <div key={team.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{team.name}</h3>
                                <p style={{ fontSize: '12px', color: '#818cf8' }}>
                                    {team.adminUser.id === user.id ? 'Admin' : 'Member'}
                                </p>
                            </div>
                            <Users color="#94a3b8" />
                        </div>

                        {/* Members List */}
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {(teamMembers[team.id] || []).map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                                        <span>{member.name} {member.id === team.adminUser.id && <span style={{ color: '#818cf8', fontSize: '10px' }}>(Admin)</span>}</span>
                                        {team.adminUser.id === user.id && member.id !== user.id && (
                                            <button onClick={() => handleRemoveMember(team.id, member.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }} title="Remove member">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invite Member - Admin only */}
                        {team.adminUser?.id === user.id && (
                            <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="email"
                                        className="form-control"
                                        style={{ fontSize: '13px', padding: '8px 12px' }}
                                        placeholder="Invite by email"
                                        value={invitationEmail[team.id] || ''}
                                        onChange={(e) => setInvitationEmail({ ...invitationEmail, [team.id]: e.target.value })}
                                    />
                                    <button onClick={() => handleInvite(team.id)} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                        Invite
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {myTeams.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                    You are not part of any teams yet. Create one or wait for an invitation!
                </div>
            )}
        </div>
    );
}
