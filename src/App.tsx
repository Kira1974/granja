import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/Login';
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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
}

function CoordRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.rol !== 'coordinador') return <Navigate to={ROUTES.GRANJA} replace />;
  return <>{children}</>;
}

function CoordMayordomoRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.rol !== 'coordinador' && user.rol !== 'mayordomo') return <Navigate to={ROUTES.GRANJA} replace />;
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
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.GRANJA} replace />} />
        <Route path={ROUTES.GRANJA} element={<GranjaPage />} />
        <Route path={ROUTES.ZONAS}  element={<ZonasPage />} />
        <Route path={ROUTES.COORDINACION} element={<CoordinacionPage />} />
        <Route path={ROUTES.INVENTARIO}          element={<InventarioPage />} />
        <Route path={ROUTES.INVENTARIO_DETALLE}  element={<InventarioDetallePage />} />
        <Route path={ROUTES.CULTIVOS}     element={<CultivosPage />} />
        <Route path={ROUTES.TRACTOR}      element={<TractorPage />} />
        <Route path={ROUTES.COMBUSTIBLE}  element={<CombustiblesPage />} />
        <Route path={ROUTES.REPORTES}     element={<CoordMayordomoRoute><ReportesPage /></CoordMayordomoRoute>} />
        <Route
          path={ROUTES.TRAZABILIDAD}
          element={<CoordRoute><TrazabilidadPage /></CoordRoute>}
        />
        <Route
          path={ROUTES.USUARIOS}
          element={
            <CoordRoute>
              <UsuariosPage />
            </CoordRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.GRANJA} replace />} />
    </Routes>
  );
}
