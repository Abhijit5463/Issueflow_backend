import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Users, UserPlus, Trash2, Check, X, Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Teams() {
    const { api, user } = useContext(AuthContext);
    const [myTeams, setMyTeams] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [invitationEmail, setInvitationEmail] = useState({});
    const [teamMembers, setTeamMembers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviterLoading, setInviterLoading] = useState({});

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
        const email = invitationEmail[teamId];
        if (!email) return;

        try {
            setInviterLoading({ ...inviterLoading, [teamId]: true });
            // Verify if user exists first
            const existsRes = await api.get(`users/exists?email=${email}`);
            if (!existsRes.data) {
                setError(`User with email ${email} does not exist in IssueFlow.`);
                setInviterLoading({ ...inviterLoading, [teamId]: false });
                return;
            }

            await api.post(`teams/${teamId}/invite`, { email });
            setInvitationEmail({ ...invitationEmail, [teamId]: '' });
            alert('Invitation sent!');
            setError(''); // Clear error on success
        } catch (err) {
            setError('Failed to send invitation');
        } finally {
            setInviterLoading({ ...inviterLoading, [teamId]: false });
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

    if (loading) return <LoadingSpinner />;

    return (

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }} className="animate-fade-in">
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: 'var(--text-main)' }}>
                <span style={{ color: 'var(--primary)' }}>Team</span> Management
            </h1>

            {error && (
                <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--danger)' }}>
                    {error}
                </div>
            )}

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <div className="card" style={{ marginBottom: '32px', border: '1px solid var(--primary)', background: 'var(--primary-light)' }}>
                    <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--primary)' }}>
                        <UserPlus size={20} color="var(--primary)" /> Pending Invitations
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {invitations.map(inv => (
                            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                                <div>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{inv.team.name}</span>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Invited by: {inv.inviter.name}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleRespondInvitation(inv.id, 'ACCEPTED')} className="btn" style={{ background: 'var(--success)', color: 'white', padding: '8px 12px' }} title="Accept">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => handleRespondInvitation(inv.id, 'DECLINED')} className="btn" style={{ background: 'var(--danger)', color: 'white', padding: '8px 12px' }} title="Decline">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Team Section */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>
                    <Plus size={20} color="var(--primary)" /> Create New Team
                </h2>
                <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '12px' }}>
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
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)' }}>My Teams</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {myTeams.map(team => (
                    <div key={team.id} className="card" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{team.name}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500', marginTop: '4px' }}>
                                    {team.adminUser.id === user.id ? 'Admin' : 'Member'}
                                </p>
                            </div>
                            <Users color="var(--text-muted)" />
                        </div>

                        {/* Members List */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Members</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(teamMembers[team.id] || []).map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{member.name} {member.id === team.adminUser.id && <span style={{ color: 'var(--primary)', fontSize: '11px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>ADMIN</span>}</span>
                                        {team.adminUser.id === user.id && member.id !== user.id && (
                                            <button onClick={() => handleRemoveMember(team.id, member.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Remove member">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invite Member - Admin only */}
                        {team.adminUser?.id === user.id && (
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="email"
                                        className="form-control"
                                        style={{ fontSize: '13px', padding: '8px 12px' }}
                                        placeholder="Invite by email"
                                        value={invitationEmail[team.id] || ''}
                                        onChange={(e) => setInvitationEmail({ ...invitationEmail, [team.id]: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleInvite(team.id)}
                                        className="btn btn-primary"
                                        style={{ padding: '8px 16px' }}
                                        disabled={inviterLoading[team.id]}
                                    >
                                        {inviterLoading[team.id] ? 'Inviting...' : 'Invite'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {myTeams.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '48px', padding: '40px', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                    <Users size={48} color="var(--border-default)" style={{ marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>You are not part of any teams yet.</p>
                    <p style={{ fontSize: '14px' }}>Create one above or wait for an invitation!</p>
                </div>
            )}
        </div>
    );
}
