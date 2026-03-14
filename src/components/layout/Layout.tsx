import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import MainNavbar from './MainNavbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay oscuro cuando el sidebar está abierto en mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Con sesión: col-lg-10 offset-lg-2 (deja espacio al sidebar) */}
        {/* Sin sesión: col-12 (ancho completo, sin sidebar) */}
        <main className={`main-content col-12 p-0${user ? ' col-lg-10 offset-lg-2' : ''}`}>
          <MainNavbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
