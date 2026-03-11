import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Notificacion {
  id: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  titulo: string;
  detalle: string;
  tiempo: string;
  leida: boolean;
}

const MOCK_NOTIFS: Notificacion[] = [
  {
    id: 1,
    icon: 'warning',
    iconBg: '#FDF3DC',
    iconColor: '#C8A84B',
    titulo: 'Stock bajo — Dual Gold',
    detalle: 'Quedan 19 L, mínimo requerido: 25 L.',
    tiempo: 'Hace 10 min',
    leida: false,
  },
  {
    id: 2,
    icon: 'build',
    iconBg: '#F5E8E8',
    iconColor: '#8B1A1A',
    titulo: 'Mantenimiento pendiente',
    detalle: 'Fumigadora motorizada — revisión de boquillas.',
    tiempo: 'Hace 1 hora',
    leida: false,
  },
  {
    id: 3,
    icon: 'grass',
    iconBg: '#E8F5E9',
    iconColor: '#2D6A4F',
    titulo: 'Actividad registrada',
    detalle: 'Segunda fertilización en Lote E2 — Maíz.',
    tiempo: 'Hace 3 horas',
    leida: true,
  },
  {
    id: 4,
    icon: 'local_gas_station',
    iconBg: '#E8F0FE',
    iconColor: '#3D5170',
    titulo: 'Carga de combustible registrada',
    detalle: 'ACPM — Lote E3, 16 galones.',
    tiempo: 'Ayer',
    leida: true,
  },
];

interface MainNavbarProps {
  onToggleSidebar: () => void;
}

export default function MainNavbar({ onToggleSidebar }: MainNavbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifs, setNotifs]             = useState<Notificacion[]>(MOCK_NOTIFS);

  const sinLeer = notifs.filter(n => !n.leida).length;

  const marcarLeida = (id: number) =>
    setNotifs(p => p.map(n => n.id === id ? { ...n, leida: true } : n));

  const marcarTodas = () =>
    setNotifs(p => p.map(n => ({ ...n, leida: true })));

  return (
    <div className="main-navbar sticky-top bg-white">
      <nav className="navbar align-items-stretch navbar-light flex-md-nowrap p-0">

        {/* Botón hamburguesa — solo mobile (visible vía CSS media query) */}
        <button
          className="navbar-hamburger"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <i className="material-icons">menu</i>
        </button>

        {/* Lado izquierdo vacío (reservado para search futuro) */}
        <div className="flex-grow-1" />

        {/* Acciones derecha */}
        <ul className="navbar-nav border-left flex-row">

          {/* Notificaciones — solo coordinador */}
          {user?.rol === 'coordinador' && (
            <li className="nav-item border-right d-flex align-items-center" style={{ position: 'relative' }}>
              <a
                className="nav-link nav-link-icon text-center px-3"
                href="#"
                title="Notificaciones"
                onClick={e => { e.preventDefault(); setNotifOpen(o => !o); setProfileOpen(false); }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <i className="material-icons" style={{ fontSize: 22, color: notifOpen ? 'var(--usco-red)' : '#818EA3' }}>
                    notifications
                  </i>
                  {sinLeer > 0 && (
                    <span
                      className="badge badge-pill badge-danger"
                      style={{ position: 'absolute', top: -4, right: -6, fontSize: '0.5rem', padding: '3px 5px' }}
                    >
                      {sinLeer}
                    </span>
                  )}
                </div>
              </a>

              {notifOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setNotifOpen(false)} />
                  <div className="card" style={{
                    position: 'absolute', top: '100%', right: 0, zIndex: 100,
                    width: 340, padding: 0,
                    border: '1px solid #e3e6ec',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e3e6ec',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#3D5170' }}>
                        Notificaciones
                        {sinLeer > 0 && (
                          <span className="badge badge-pill badge-danger ml-2" style={{ fontSize: '0.6rem' }}>
                            {sinLeer} nuevas
                          </span>
                        )}
                      </span>
                      {sinLeer > 0 && (
                        <button
                          onClick={marcarTodas}
                          style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--usco-red)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          Marcar todas
                        </button>
                      )}
                    </div>

                    {/* Lista */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifs.map(n => (
                        <div
                          key={n.id}
                          onClick={() => marcarLeida(n.id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f2f5',
                            background: n.leida ? '#fff' : '#FDFAF4',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FA')}
                          onMouseLeave={e => (e.currentTarget.style.background = n.leida ? '#fff' : '#FDFAF4')}
                        >
                          {/* Ícono */}
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: n.iconBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className="material-icons" style={{ fontSize: 18, color: n.iconColor }}>{n.icon}</i>
                          </div>

                          {/* Texto */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: n.leida ? 400 : 600,
                              color: '#3D5170', marginBottom: 2,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {n.titulo}
                            </div>
                            <div style={{ fontSize: 11, color: '#818EA3', marginBottom: 3 }}>
                              {n.detalle}
                            </div>
                            <div style={{ fontSize: 10, color: '#B0B8C4', fontWeight: 500 }}>
                              {n.tiempo}
                            </div>
                          </div>

                          {/* Punto no leída */}
                          {!n.leida && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--usco-red)', flexShrink: 0, marginTop: 5 }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: '10px 16px', borderTop: '1px solid #e3e6ec',
                      textAlign: 'center',
                    }}>
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); setNotifOpen(false); }}
                        style={{ fontSize: 12, color: 'var(--usco-red)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Ver todas las notificaciones
                      </a>
                    </div>
                  </div>
                </>
              )}
            </li>
          )}

          {/* Perfil */}
          <li className="nav-item d-flex align-items-center" style={{ position: 'relative' }}>
            <a
              className="nav-link px-3 d-flex align-items-center"
              href="#"
              onClick={e => { e.preventDefault(); setProfileOpen(o => !o); }}
              style={{ gap: 8, cursor: 'pointer' }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--usco-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <span className="d-none d-md-inline" style={{ fontSize: 13, color: '#3D5170', fontWeight: 500 }}>
                {user?.nombre}
              </span>
              <i className="material-icons" style={{ fontSize: 18, color: '#818EA3' }}>arrow_drop_down</i>
            </a>

            {profileOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />
                <div className="card" style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 100,
                  minWidth: 210, padding: 0, border: '1px solid #e3e6ec',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e3e6ec' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#3D5170' }}>{user?.nombre}</div>
                    <div style={{ fontSize: 11, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.rol}</div>
                    <div style={{ fontSize: 11, color: '#818EA3', marginTop: 2 }}>{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="btn btn-light w-100"
                    style={{ borderRadius: 0, textAlign: 'left', padding: '10px 16px', fontSize: 13, color: '#E07A5F' }}
                  >
                    <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>exit_to_app</i>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
