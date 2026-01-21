import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

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
            const response = await api.get(`tickets?page=${pageNo}&size=10&search=${searchTerm || ''}&onlyMyTeam=${onlyMyTeam}`);
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
            case 'HIGH': return '#ef4444'; // Red-500
            case 'MEDIUM': return '#f59e0b'; // Amber-500
            case 'LOW': return '#10b981'; // Emerald-500 (changed from teal for consistency)
            default: return '#94a3b8';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', marginBottom: '4px' }}>Dashboard</h2>
                    <p>Manage and track your incident tickets</p>
                </div>
                <Link to="/create" className="btn btn-primary">
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Create Ticket
                </Link>
            </div>

            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '24px' }}>
                <button
                    onClick={() => setViewMode('all')}
                    style={{
                        padding: '12px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: viewMode === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: viewMode === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    All Tickets
                </button>
                <button
                    onClick={() => setViewMode('my_team')}
                    style={{
                        padding: '12px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: viewMode === 'my_team' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: viewMode === 'my_team' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    My Team
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Ticket ID</th>
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
                                        <Link to={`/ticket/${ticket.id}`} style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                            INC{String(ticket.id).padStart(7, '0')}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/ticket/${ticket.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{ticket.title}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {ticket.description?.substring(0, 60)}{ticket.description?.length > 60 ? '...' : ''}
                                            </div>
                                        </Link>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: getPriorityColor(ticket.priority)
                                            }}></div>
                                            <span style={{ fontWeight: '500', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {ticket.priority?.charAt(0) + ticket.priority?.slice(1).toLowerCase()}
                                            </span>
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
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'var(--primary-light)',
                                                    color: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '11px',
                                                    fontWeight: '700'
                                                }}>
                                                    {ticket.assignee.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '500' }}>{ticket.assignee}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy • HH:mm') : '-'}
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <AlertCircle size={32} color="var(--border-default)" />
                                            <p style={{ margin: 0, fontWeight: '500' }}>No tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="btn btn-secondary"
                    style={{ opacity: page === 0 ? 0.5 : 1 }}
                >
                    Previous
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
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
