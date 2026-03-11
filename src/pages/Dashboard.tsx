import { useAuth } from '@/context/AuthContext';
import { C } from '@/constants/colors';
import { Card, Badge } from '@/components/ui';
import {
  MOCK_ACTIVIDADES_COORD,
  MOCK_INVENTARIO,
  MOCK_ACTIVIDADES_CULTIVO,
  MOCK_TRACTOR,
} from '@/constants/mockData';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
  const { user } = useAuth();
  const alertas = MOCK_INVENTARIO.filter(i => ['Bajo stock', 'Mantenimiento'].includes(i.estado));
  const horasTractor = MOCK_TRACTOR.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);

  const stats = [
    { icon: 'assignment',        label: 'Actividades coord.', value: MOCK_ACTIVIDADES_COORD.length,   color: 'var(--usco-red)' },
    { icon: 'inventory_2',       label: 'Items inventario',   value: MOCK_INVENTARIO.length,          color: '#3D9BE9' },
    { icon: 'grass',             label: 'Actividades lotes',  value: MOCK_ACTIVIDADES_CULTIVO.length, color: C.verde },
    { icon: 'agriculture',       label: 'Horas tractor',      value: `${horasTractor}h`,              color: C.tierra },
    { icon: 'warning',           label: 'Alertas activas',    value: alertas.length,                  color: C.alerta },
  ];

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
      <Header title="Dashboard" subtitle="Resumen general del sistema" />

        <p className="mb-4 px-4" style={{ fontSize: 13, color: C.gris }}>
          Bienvenido, <strong>{user?.nombre}</strong> — {new Date().toLocaleDateString('es-CO', { dateStyle: 'full' })}
        </p>

        {/* Stats */}
        <div className="row mb-4">
          {stats.map(s => (
            <div key={s.label} className="col-lg col-md-4 col-sm-6 mb-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center" style={{ gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: s.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className="material-icons" style={{ color: s.color, fontSize: 24 }}>{s.icon}</i>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#3D5170' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#818EA3' }}>{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paneles */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <Card>
              <h6 className="mb-3" style={{ fontWeight: 700, color: '#3D5170' }}>
                Últimas actividades de coordinación
              </h6>
              {MOCK_ACTIVIDADES_COORD.slice(0, 3).map(a => (
                <div key={a.id} className="d-flex" style={{ padding: '10px 0', borderBottom: `1px solid ${C.grisL}`, gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.verde, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3D5170' }}>
                      {a.descripcion.slice(0, 65)}…
                    </div>
                    <div style={{ fontSize: 11, color: C.gris, marginTop: 2 }}>
                      {a.fecha} · <Badge label={a.categoria} />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div className="col-md-6 mb-3">
            <Card>
              <h6 className="mb-3" style={{ fontWeight: 700, color: '#3D5170' }}>
                Alertas de inventario
              </h6>
              {alertas.length === 0 && (
                <p style={{ fontSize: 13, color: C.gris }}>Sin alertas activas.</p>
              )}
              {alertas.map(i => (
                <div key={i.id} className="d-flex justify-content-between align-items-center" style={{ padding: '10px 0', borderBottom: `1px solid ${C.grisL}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3D5170' }}>{i.nombre}</div>
                    <div style={{ fontSize: 11, color: C.gris }}>{i.cantidad} {i.unidad}</div>
                  </div>
                  <Badge label={i.estado} />
                </div>
              ))}
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
