import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { Save, ArrowLeft, CheckCircle, Clock, Paperclip, FileText } from 'lucide-react';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    // For editable fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: '',
        status: '',
        reporter: '',
        resolution: '',
        assignee: '',
        timeWorked: '',
        referencedKb: '',
        elapsedTime: '',
        recurringIssue: false
    });

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`tickets/${id}`);
            setTicket({ ...response.data, attachments: response.data.attachments || [] });
            setFormData({
                title: response.data.title,
                description: response.data.description,
                priority: response.data.priority,
                status: response.data.status,
                reporter: response.data.reporter || '',
                resolution: response.data.resolution || '',
                assignee: response.data.assignee || '',
                timeWorked: response.data.timeWorked || '',
                referencedKb: response.data.referencedKb || '',
                elapsedTime: response.data.elapsedTime || '',
                recurringIssue: response.data.recurringIssue || false
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ticket", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            form.elements[index + 1].focus();
        }
    };

    const handleSave = async () => {
        try {
            // Auto-close logic: If resolution is being set and ticket is not closed, set status to CLOSED
            let dataToSubmit = { ...formData };
            if (formData.resolution && formData.resolution.trim() !== '' && ticket.status !== 'CLOSED') {
                dataToSubmit.status = 'CLOSED';
            }

            if (formData.resolution && formData.resolution.trim() !== '' && ticket.status !== 'CLOSED') {
                dataToSubmit.status = 'CLOSED';
            }

            await api.put(`tickets/${id}`, dataToSubmit);
            alert("Ticket updated");
            fetchTicket();
        } catch (error) {
            console.error("Error updating ticket", error);
            alert("Error: " + (error.response?.data?.message || error.message));
        }
    };

    const fileInputRef = useRef(null);
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`tickets/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("File attached successfully");
            fetchTicket();
        } catch (error) {
            console.error("Error uploading file", error);
            alert("Failed to upload file");
        }
    };

    const calculateDuration = () => {
        if (!ticket || !ticket.closedAt) return null;
        const start = new Date(ticket.createdAt);
        const end = new Date(ticket.closedAt);
        const hours = differenceInHours(end, start);
        const mins = differenceInMinutes(end, start) % 60;
        return `${hours}h ${mins}m`;
    };

    if (loading) return <div>Loading...</div>;
    if (!ticket) return <div>Ticket not found</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                INC{String(ticket.id).padStart(7, '0')}
                            </span>
                            <span className={`status-badge status-${ticket.status.toLowerCase().replace('_', '-')}`}>
                                {ticket.status.replaceAll('_', ' ').toLowerCase()}
                            </span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '5px 0 0 0', color: '#f8fafc' }}>{formData.title}</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {ticket.status === 'CLOSED' ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '14px', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                                <CheckCircle size={16} /> Closed {calculateDuration() && `in ${calculateDuration()}`}
                            </div>
                            <button onClick={async () => {
                                try {
                                    const updatedData = { ...formData, status: 'IN_PROGRESS' };
                                    await api.put(`tickets/${id}`, updatedData);
                                    fetchTicket();
                                } catch (e) { alert(e.message); }
                            }} className="btn btn-secondary">Reopen Ticket</button>
                        </>
                    ) : (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <button onClick={() => fileInputRef.current.click()} className="btn btn-secondary" title="Attach File">
                                <Paperclip size={16} />
                            </button>
                            <button onClick={handleSave} className="btn btn-primary">
                                <Save size={16} /> Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Attachments Section */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginTop: 0, marginBottom: '20px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Paperclip size={16} color="#6366f1" />
                                Attachments
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {ticket.attachments.map((file, index) => (
                                    <a
                                        key={index}
                                        href={`/api/tickets/uploads/${file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            background: '#f1f5f9',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            color: '#334155',
                                            fontSize: '13px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <FileText size={14} color="#64748b" />
                                        {file.substring(file.indexOf('_') + 1)}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginTop: 0, marginBottom: '20px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '16px', background: '#6366f1', borderRadius: '2px' }}></div>
                            Incident Details
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Short Description</label>
                            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} disabled={ticket.status === 'CLOSED'} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-control" rows="8" value={formData.description} onChange={handleChange} disabled={ticket.status === 'CLOSED'} style={{ lineHeight: '1.6' }} />
                        </div>
                    </div>

                    <div className="card" style={{ borderTop: '4px solid #10b981' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginTop: 0, marginBottom: '20px', color: '#475569' }}>
                            Resolution Information
                        </h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Resolution Notes</label>
                                <textarea
                                    name="resolution"
                                    className="form-control"
                                    rows="4"
                                    value={formData.resolution}
                                    onChange={handleChange}
                                    placeholder="Enter resolution details..."
                                    disabled={ticket.status === 'CLOSED'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Time Worked</label>
                                    <input
                                        type="text"
                                        name="timeWorked"
                                        className="form-control"
                                        value={formData.timeWorked}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={ticket.status === 'CLOSED'}
                                        placeholder="e.g. 2h 30m"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Elapsed Time</label>
                                    <input
                                        type="text"
                                        name="elapsedTime"
                                        className="form-control"
                                        value={formData.elapsedTime}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={ticket.status === 'CLOSED'}
                                        placeholder="Duration to fix"
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Referenced KB</label>
                                <input
                                    type="text"
                                    name="referencedKb"
                                    className="form-control"
                                    value={formData.referencedKb}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    disabled={ticket.status === 'CLOSED'}
                                    placeholder="KB Article ID"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="recurringIssue"
                                    id="recurringIssue"
                                    checked={formData.recurringIssue}
                                    onChange={handleChange}
                                    disabled={ticket.status === 'CLOSED'}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <label htmlFor="recurringIssue" style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>Recurring Issue?</label>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginTop: 0, marginBottom: '20px', color: '#475569' }}>
                            Properties
                        </h3>

                        <div className="form-group">
                            <label className="form-label">State</label>
                            <select name="status" className="form-control" value={formData.status} onChange={handleChange} disabled={ticket.status === 'CLOSED'}>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select name="priority" className="form-control" value={formData.priority} onChange={handleChange} disabled={ticket.status === 'CLOSED'}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Assignee</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" name="assignee" className="form-control" value={formData.assignee} onChange={handleChange} disabled={ticket.status === 'CLOSED'} placeholder="Unassigned" />
                                <button className="btn btn-secondary" disabled={ticket.status === 'CLOSED'} onClick={() => setFormData({ ...formData, assignee: 'CurrentUser' })} style={{ padding: '0 12px' }} title="Assign to Me">
                                    <span style={{ fontSize: '18px' }}>@</span>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Reporter</label>
                            <input type="text" name="reporter" className="form-control" value={formData.reporter} onChange={handleChange} disabled={ticket.status === 'CLOSED'} />
                        </div>

                        <div style={{ paddingTop: '15px', borderTop: '1px solid #f1f5f9', marginTop: '15px' }}>
                            <div className="form-group" style={{ marginBottom: '10px' }}>
                                <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>Created</label>
                                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={12} color="#94a3b8" />
                                    {format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm')}
                                </div>
                            </div>

                            {ticket.closedAt && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>Closed</label>
                                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle size={12} color="#10b981" />
                                        {format(new Date(ticket.closedAt), 'MMM d, yyyy HH:mm')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
