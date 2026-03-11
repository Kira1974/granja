import { C } from '@/constants/colors';
import { MOCK_INVENTARIO, MOCK_MOVIMIENTOS, MOCK_ACTIVIDADES_CULTIVO, MOCK_TRACTOR, MOCK_COMBUSTIBLE, MOCK_ACTIVIDADES_COORD } from '@/constants/mockData';
import Header from '@/components/layout/Header';

// ── Helpers ────────────────────────────────────────────────────────────────────
const hoy    = new Date();
const hace30 = new Date(hoy); hace30.setDate(hoy.getDate() - 30);
const esMes  = (f: string) => new Date(f) >= hace30;

// Stats derivados de los datos mock
const cultivosMes   = MOCK_ACTIVIDADES_CULTIVO.filter(a => esMes(a.fecha)).length;
const tractorMes    = MOCK_TRACTOR.filter(t => esMes(t.fecha)).reduce((s, t) => s + (parseFloat(t.total) || 0), 0);
const combustMes    = MOCK_COMBUSTIBLE.filter(c => esMes(c.fecha));
const coordMes      = MOCK_ACTIVIDADES_COORD.filter(a => esMes(a.fecha)).length;
const stockBajos    = MOCK_INVENTARIO.filter(i => i.stockMinimo != null && i.cantidad <= i.stockMinimo);
const acpmTotal     = combustMes.filter(c => c.tipo === 'ACPM').reduce((s, c) => s + (parseFloat(c.lecturaGal) || 0), 0);
const gasolinaTotal = combustMes.filter(c => c.tipo === 'Gasolina mezclada').reduce((s, c) => s + (parseFloat(c.lecturaGal) || 0), 0);

// Actividades más frecuentes en cultivos
const actFrec = Object.entries(
  MOCK_ACTIVIDADES_CULTIVO.reduce<Record<string, number>>((acc, a) => {
    const key = a.actividad.split(' ').slice(0, 3).join(' ');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})
).sort((a, b) => b[1] - a[1]).slice(0, 5);

// Insumos más usados (por total cantidadMovida en movimientos)
const insumosUsados = MOCK_INVENTARIO
  .filter(i => i.tipo === 'insumo')
  .map(i => ({
    nombre: i.nombre,
    unidad: i.unidad,
    total:  (MOCK_MOVIMIENTOS[i.id] ?? [])
              .filter(m => m.accion === 'Uso en campo')
              .reduce((s, m) => s + m.cantidadMovida, 0),
  }))
  .filter(i => i.total > 0)
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);

// ── Componentes locales ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="col-6 col-md-3 mb-4">
      <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
        <div className="d-flex align-items-center" style={{ gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="material-icons" style={{ color, fontSize: 22 }}>{icon}</i>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3D5170', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: '#818EA3', marginTop: 2 }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: C.gris, marginTop: 1 }}>{sub}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span style={{ fontSize: 12, color: '#3D5170' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: '#F0F2F5', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

export default function ReportesPage() {
  return (
    <div>
      <div className="main-content-container container-fluid py-4">
        <Header title="Reportes" subtitle="Resumen de actividad de la Granja Experimental — últimos 30 días" />

        {/* ── Tarjetas resumen ── */}
        <div className="row">
          <StatCard icon="grass"             label="Actividades cultivos (mes)" value={cultivosMes}              color={C.verde}   sub="Lotes E1, E2, E4, E5, E6" />
          <StatCard icon="agriculture"       label="Horas tractor (mes)"        value={`${tractorMes.toFixed(1)}h`} color={C.tierra}  sub="Massey Ferguson 290" />
          <StatCard icon="assignment"        label="Registros coordinación (mes)" value={coordMes}              color={'#8B1A1A'}  sub="Actividades supervisadas" />
          <StatCard icon="warning"           label="Ítems con stock bajo"       value={stockBajos.length}        color={'#C8A84B'}  sub="Por debajo del mínimo" />
        </div>

        <div className="row">
          {/* ── Actividades más frecuentes ── */}
          <div className="col-12 col-md-6 mb-4">
            <div className="card" style={{ padding: '1.25rem 1.5rem', height: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Actividades más frecuentes — Cultivos
              </div>
              {actFrec.length > 0 ? actFrec.map(([act, count]) => (
                <BarRow key={act} label={act} value={count} max={actFrec[0][1]} color={C.verde} />
              )) : <p style={{ fontSize: 13, color: C.gris }}>Sin datos.</p>}
            </div>
          </div>

          {/* ── Insumos más usados ── */}
          <div className="col-12 col-md-6 mb-4">
            <div className="card" style={{ padding: '1.25rem 1.5rem', height: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Insumos más utilizados
              </div>
              {insumosUsados.map(i => (
                <BarRow key={i.nombre} label={i.nombre} value={i.total} max={insumosUsados[0].total} color={C.tierra} />
              ))}
              {insumosUsados.length === 0 && <p style={{ fontSize: 13, color: C.gris }}>Sin datos.</p>}
            </div>
          </div>

          {/* ── Alertas de stock ── */}
          <div className="col-12 col-md-6 mb-4">
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Alertas de inventario
              </div>
              {stockBajos.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.verde, fontSize: 13 }}>
                  <i className="material-icons" style={{ fontSize: 18 }}>check_circle</i>
                  Todos los ítems están sobre su stock mínimo.
                </div>
              ) : stockBajos.map(i => (
                <div key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F2F5' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3D5170' }}>{i.nombre}</div>
                    <div style={{ fontSize: 11, color: C.gris }}>{i.categoria}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#8B1A1A' }}>{i.cantidad} {i.unidad}</div>
                    <div style={{ fontSize: 10, color: C.gris }}>Mín: {i.stockMinimo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Combustible del mes ── */}
          <div className="col-12 col-md-6 mb-4">
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Consumo de combustible (mes)
              </div>
              {[
                { label: 'ACPM', value: acpmTotal,     color: '#1E40AF', bg: '#DBEAFE', icon: 'agriculture' },
                { label: 'Gasolina mezclada', value: gasolinaTotal, color: '#92400E', bg: '#FEF3C7', icon: 'local_gas_station' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #F0F2F5' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="material-icons" style={{ color: item.color, fontSize: 20 }}>{item.icon}</i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#3D5170' }}>{item.label}</div>
                    <div style={{ height: 4, borderRadius: 3, background: '#F0F2F5', marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(item.value / (acpmTotal + gasolinaTotal || 1)) * 100}%`, background: item.color, borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value.toFixed(1)} <span style={{ fontSize: 11, fontWeight: 400 }}>gal</span></div>
                </div>
              ))}
              {combustMes.length === 0 && <p style={{ fontSize: 13, color: C.gris }}>Sin registros en los últimos 30 días.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
