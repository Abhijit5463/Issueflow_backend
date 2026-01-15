export default function LoadingSpinner({ size = 40, color = 'var(--primary)' }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            width: '100%'
        }}>
            <div className="spinner" style={{
                width: size,
                height: size,
                borderColor: `${color} transparent ${color} transparent`
            }}></div>
        </div>
    );
}
