import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function CreateTicket() {
    const navigate = useNavigate();
    const { api } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'LOW',
        status: 'OPEN',
        reporter: '',
        team: null
    });
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await api.get('teams');
                setTeams(res.data);
            } catch (err) {
                console.error("Failed to fetch teams", err);
            }
        };
        fetchTeams();
    }, [api]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('tickets', formData);
            navigate('/');
        } catch (error) {
            console.error("Error creating ticket", error);
            const message = error.response?.data?.message || error.message || "Failed to create ticket";
            alert(`Failed to create ticket: ${message}`);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Create New Incident</h2>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginTop: 0, marginBottom: '25px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '16px', background: '#6366f1', borderRadius: '2px' }}></div>
                    Ticket Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Short Description <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required placeholder="Brief summary of the issue" />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Description <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea name="description" className="form-control" rows="6" value={formData.description} onChange={handleChange} required placeholder="Detailed explanation of the incident..." style={{ lineHeight: '1.6' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reporter <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" name="reporter" className="form-control" value={formData.reporter} onChange={handleChange} placeholder="Enter your name" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                            <option value="LOW">Low - Routine</option>
                            <option value="MEDIUM">Medium - Urgent</option>
                            <option value="HIGH">High - Critical</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Assign Team</label>
                        <select
                            name="team"
                            className="form-control"
                            value={formData.team ? formData.team.id : ''}
                            onChange={(e) => {
                                const selectedTeam = teams.find(t => t.id === parseInt(e.target.value));
                                setFormData({ ...formData, team: selectedTeam || null });
                            }}
                        >
                            <option value="">Public (No Team)</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ width: '100px' }}>Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '140px', justifyContent: 'center' }}>
                            <Save size={16} /> Submit Ticket
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
