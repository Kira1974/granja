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
    <aside className={`main-sidebar col-12 col-md-3 col-lg-2 px-0${open ? ' sidebar-open' : ''}`}>
      {/* Logo + botón cerrar (mobile) */}
      <div className="main-navbar">
        <nav className="navbar align-items-stretch flex-md-nowrap border-bottom p-0">
          <div className="navbar-brand w-100 mr-0" style={{ lineHeight: '25px', cursor: 'default' }}>
            <div className="d-table m-auto">
              <img
                src={uscoLogo}
                alt="USCO"
                style={{ maxWidth: 40, maxHeight: 40, objectFit: 'contain' }}
                className="d-inline-block align-top mr-2"
              />
              <span className="d-none d-md-inline" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Granja Experimental
              </span>
            </div>
          </div>
          {/* Botón X — solo visible en mobile */}
          <button className="d-md-none sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
            <i className="material-icons">close</i>
          </button>
        </nav>
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
