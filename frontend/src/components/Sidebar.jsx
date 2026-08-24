import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Chats', end: true },
  { to: '/presets', label: 'Presets' },
  { to: '/usage', label: 'Usage' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

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
          <span>{user?.name}</span>
          <small>{user?.plan} plan</small>
        </div>
        <button className="btn-secondary" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
