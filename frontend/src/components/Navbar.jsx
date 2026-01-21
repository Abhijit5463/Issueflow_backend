import { Link } from 'react-router-dom';
import { Home, PlusCircle, Search, Users, LogOut, User, LayoutDashboard, Ticket } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const NavLink = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isActive ? '#818cf8' : '#e2e8f0',
            transition: '0.2s',
            padding: '6px 12px',
            borderRadius: '6px',
            background: isActive ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
            textDecoration: 'none'
        }}>
            {icon} {label}
        </Link>
    );
};

export default function Navbar() {
    const { searchTerm, setSearchTerm, logout } = useContext(AuthContext);
    const location = useLocation();

    return (
        <header style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '0 30px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#818cf8' }}>Issue</span><span style={{ color: '#e2e8f0' }}>Flow</span>
                    </h1>
                </Link>
                <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
                    <NavLink to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                    <NavLink to="/teams" icon={<Users size={16} />} label="Teams" />
                    <NavLink to="/profile" icon={<User size={16} />} label="Profile" />
                    <Link to="/create" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', transition: '0.2s', padding: '6px 12px', borderRadius: '6px', background: location.pathname === '/create' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                        <PlusCircle size={16} /> New Ticket
                    </Link>
                </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '10px 16px 10px 36px',
                            borderRadius: '24px',
                            fontSize: '13px',
                            width: '260px',
                            outline: 'none',
                            transition: '0.3s'
                        }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '14px', top: '11px', color: '#94a3b8' }} />
                </div>
                <button
                    onClick={logout}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: '0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>
        </header>
    );
}
