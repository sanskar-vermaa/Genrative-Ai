import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-center">
      <h1 className="glow-title">404</h1>
      <p className="muted">This page doesn't exist.</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
        Back to chat
      </Link>
    </div>
  );
}
