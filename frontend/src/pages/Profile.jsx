import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { User, Mail, Shield, Ticket, CheckCircle, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
    const { user, api } = useContext(AuthContext);
    const [stats, setStats] = useState({ reportedCount: 0, resolvedCount: 0 });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('users/stats');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch stats", err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');
        try {
            const res = await api.post('users/profile/update', formData);
            setMessage({ type: 'success', text: res.data.message });
            // In a real app, you might want to update the context user here if name/email changed
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        }
        setUpdating(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }} className="animate-fade-in">
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px', color: '#f8fafc' }}>
                User <span style={{ color: '#818cf8' }}>Profile</span>
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Stats Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            margin: '0 auto 15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '32px',
                            fontWeight: 'bold'
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ margin: '0 0 5px', fontSize: '20px' }}>{user?.name}</h2>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>{user?.email}</p>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
                                    <Ticket size={18} color="#818cf8" />
                                    <span>Tickets Reported</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '18px' }}>{stats.reportedCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
                                    <CheckCircle size={18} color="#10b981" />
                                    <span>Tickets Resolved</span>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '18px' }}>{stats.resolvedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={20} color="#818cf8" /> General Settings
                    </h3>

                    {message && (
                        <div style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={14} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={14} /> Update Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current password"
                            />
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updating}
                                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                            >
                                <Save size={18} /> {updating ? 'Updating...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
