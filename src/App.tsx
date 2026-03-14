import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/Login';
import RegistroPage from '@/pages/Registro';
import AccesoRestringido from '@/pages/AccesoRestringido';
import CoordinacionPage from '@/pages/Coordinacion';
import InventarioPage from '@/pages/Inventario';
import InventarioDetallePage from '@/pages/InventarioDetalle';
import ReportesPage from '@/pages/Reportes';
import TrazabilidadPage from '@/pages/Trazabilidad';
import CultivosPage from '@/pages/Cultivos';
import TractorPage from '@/pages/Tractor';
import CombustiblesPage from '@/pages/Combustibles';
import UsuariosPage from '@/pages/Usuarios';
import GranjaPage from '@/pages/Granja';
import ZonasPage from '@/pages/Zonas';

// Muestra AccesoRestringido si no hay sesión, sin redirigir
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <AccesoRestringido />;
}

// Solo coordinador o mayordomo; si está logueado pero no tiene rol, va a Granja
function CoordMayordomoGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <AccesoRestringido />;
  if (user.rol !== 'coordinador' && user.rol !== 'mayordomo') return <Navigate to={ROUTES.GRANJA} replace />;
  return <>{children}</>;
}

// Solo coordinador
function CoordGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <AccesoRestringido />;
  if (user.rol !== 'coordinador') return <Navigate to={ROUTES.GRANJA} replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={user ? <Navigate to={ROUTES.GRANJA} replace /> : <LoginPage />}
      />
      <Route
        path={ROUTES.REGISTRO}
        element={user ? <Navigate to={ROUTES.GRANJA} replace /> : <RegistroPage />}
      />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={ROUTES.GRANJA} replace />} />

        {/* Rutas públicas */}
        <Route path={ROUTES.GRANJA} element={<GranjaPage />} />
        <Route path={ROUTES.ZONAS}  element={<ZonasPage />} />

        {/* Rutas que requieren sesión */}
        <Route path={ROUTES.COORDINACION}        element={<AuthGuard><CoordinacionPage /></AuthGuard>} />
        <Route path={ROUTES.INVENTARIO}          element={<AuthGuard><InventarioPage /></AuthGuard>} />
        <Route path={ROUTES.INVENTARIO_DETALLE}  element={<AuthGuard><InventarioDetallePage /></AuthGuard>} />
        <Route path={ROUTES.CULTIVOS}            element={<AuthGuard><CultivosPage /></AuthGuard>} />
        <Route path={ROUTES.TRACTOR}             element={<AuthGuard><TractorPage /></AuthGuard>} />
        <Route path={ROUTES.COMBUSTIBLE}         element={<AuthGuard><CombustiblesPage /></AuthGuard>} />

        {/* Rutas que requieren rol específico */}
        <Route path={ROUTES.REPORTES}     element={<CoordMayordomoGuard><ReportesPage /></CoordMayordomoGuard>} />
        <Route path={ROUTES.TRAZABILIDAD} element={<CoordGuard><TrazabilidadPage /></CoordGuard>} />
        <Route path={ROUTES.USUARIOS}     element={<CoordGuard><UsuariosPage /></CoordGuard>} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.GRANJA} replace />} />
    </Routes>
  );
}
