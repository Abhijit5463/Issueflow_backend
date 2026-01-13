import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

export default function TicketList() {
    const { api, searchTerm } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'my_team'

    // Reset to first page when search changes
    useEffect(() => {
        setPage(0);
    }, [searchTerm, viewMode]);

    useEffect(() => {
        fetchTickets(page);
    }, [page, searchTerm, viewMode]);

    const fetchTickets = async (pageNo) => {
        try {
            setLoading(true);
            const onlyMyTeam = viewMode === 'my_team';
            const response = await api.get(`/tickets?page=${pageNo}&size=10&search=${searchTerm || ''}&onlyMyTeam=${onlyMyTeam}`);
            setTickets(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tickets", error);
            setLoading(false);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'HIGH': return '#ff4d4d';
            case 'MEDIUM': return '#ffa500';
            case 'LOW': return '#21aeb3';
            default: return '#999';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h2>
                    <p style={{ margin: 0, color: '#94a3b8' }}>Manage and track your incident tickets</p>
                </div>
                <Link to="/create" className="btn btn-primary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>+</span> Create Ticket
                    </div>
                </Link>
            </div>

            <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                <button
                    onClick={() => setViewMode('all')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: viewMode === 'all' ? '2px solid #6366f1' : '2px solid transparent',
                        color: viewMode === 'all' ? '#6366f1' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    All Tickets
                </button>
                <button
                    onClick={() => setViewMode('my_team')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: viewMode === 'my_team' ? '2px solid #6366f1' : '2px solid transparent',
                        color: viewMode === 'my_team' ? '#6366f1' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    My Team
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px', paddingLeft: '24px' }}>Ticket ID</th>
                                <th>Description</th>
                                <th style={{ width: '140px' }}>Priority</th>
                                <th style={{ width: '140px' }}>State</th>
                                <th style={{ width: '180px' }}>Assignee</th>
                                <th style={{ width: '180px' }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td style={{ paddingLeft: '24px' }}>
                                        <Link to={`/ticket/${ticket.id}`} style={{ color: '#818cf8', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                            INC{String(ticket.id).padStart(7, '0')}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/ticket/${ticket.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{ticket.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{ticket.description?.substring(0, 60)}{ticket.description?.length > 60 ? '...' : ''}</div>
                                        </Link>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: getPriorityColor(ticket.priority),
                                                boxShadow: `0 0 0 2px ${getPriorityColor(ticket.priority)}20`
                                            }}></div>
                                            <span style={{ fontWeight: '500', fontSize: '13px', color: '#475569' }}>{ticket.priority?.charAt(0) + ticket.priority?.slice(1).toLowerCase()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                                            {ticket.status.replaceAll('_', ' ').toLowerCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {ticket.assignee ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {ticket.assignee.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ color: '#334155', fontSize: '13px', fontWeight: '500' }}>{ticket.assignee}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy • HH:mm') : '-'}
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <AlertCircle size={32} color="#cbd5e1" />
                                            <p style={{ margin: 0, fontWeight: '500' }}>No tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="btn btn-secondary"
                    style={{ opacity: page === 0 ? 0.5 : 1 }}
                >
                    Previous
                </button>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                    Page {page + 1} of {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                    style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
