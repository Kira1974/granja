import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/constants/routes';
import uscoLogo from '@/assets/USCO_Logo.png';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(n =>
    !('rolesRequired' in n) || (n.rolesRequired as readonly string[]).includes(user.rol)
  );

  return (
    <aside className={`main-sidebar col-lg-2 col-12 px-0${open ? ' sidebar-open' : ''}`}>

      {/* Header: logo + botón X */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px 0 18px', height: 56,
        background: '#fff', borderBottom: '2px solid var(--usco-red)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={uscoLogo}
            alt="USCO"
            style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--usco-red-dark)', whiteSpace: 'nowrap' }}>
            Granja Experimental
          </span>
        </div>

        {/* X solo en mobile/tablet (< 992px), controlado por CSS */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
          <i className="material-icons">close</i>
        </button>
      </div>

      {/* Nav items */}
      <div className="nav-wrapper">
        <ul className="nav nav--no-borders flex-column">
          {visibleItems.map(item => (
            <li key={item.id} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <i className="material-icons">{item.icon}</i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* User info */}
      <div className="sidebar-user-info">
        <div className="user-name">{user.nombre}</div>
        <div className="user-role">{user.rol}</div>
      </div>
    </aside>
  );
}
