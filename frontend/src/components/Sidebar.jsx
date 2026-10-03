import { NavLink } from 'react-router-dom';
import { clearAll } from '../lib/store.js';

const links = [
  { to: '/', label: 'Chats', end: true },
  { to: '/presets', label: 'Presets' },
  { to: '/usage', label: 'Usage' },
];

export default function Sidebar() {
  function handleClear() {
    if (window.confirm('Delete all chats, presets and usage stats saved in this browser?')) {
      clearAll();
      window.location.assign('/');
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand">GenStudio</div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <span>No account needed</span>
          <small style={{ textTransform: "none" }}>Chats are saved in this browser</small>
        </div>
        <button className="btn-secondary" onClick={handleClear}>Clear my data</button>
      </div>
    </aside>
  );
}
