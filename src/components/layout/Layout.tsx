import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MainNavbar from './MainNavbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay oscuro cuando el sidebar está abierto en mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="main-content col-lg-10 col-md-9 col-sm-12 p-0 offset-lg-2 offset-md-3">
          <MainNavbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
