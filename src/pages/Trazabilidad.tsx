import { useState } from 'react';
import { MOCK_AUDITORIA } from '@/constants/mockData';
import { C } from '@/constants/colors';
import { ExcelButtons, Pagination } from '@/components/ui';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const MODULOS   = ['Cultivos', 'Inventario', 'Tractor', 'Combustibles', 'Coordinación'];
const ACCIONES  = ['Registro creado', 'Ítem creado', 'Ítem editado'];

const ROL_COLOR: Record<string, { bg: string; fg: string }> = {
  coordinador: { bg: '#F5E8E8', fg: '#6B0F0F' },
  mayordomo:   { bg: '#EDE8E0', fg: '#3D3020' },
  operario:    { bg: '#F0EDE8', fg: '#4A3A2A' },
  estudiante:  { bg: '#FDF8EC', fg: '#7A6020' },
};

export default function TrazabilidadPage() {
  const [filtModulo,  setFiltModulo]  = useState('');
  const [filtUsuario, setFiltUsuario] = useState('');
  const [filtAccion,  setFiltAccion]  = useState('');
  const [filtDesde,   setFiltDesde]   = useState('');
  const [filtHasta,   setFiltHasta]   = useState('');
  const [page,        setPage]        = useState(1);

  const usuarios = Array.from(new Set(MOCK_AUDITORIA.map(r => r.usuario)));

  const filtered = MOCK_AUDITORIA.filter(r => {
    if (filtModulo  && r.modulo  !== filtModulo)  return false;
    if (filtUsuario && r.usuario !== filtUsuario) return false;
    if (filtAccion  && r.accion  !== filtAccion)  return false;
    if (filtDesde   && r.fecha   <  filtDesde)    return false;
    if (filtHasta   && r.fecha   >  filtHasta)    return false;
    return true;
  });

  const hayFiltro = filtModulo || filtUsuario || filtAccion || filtDesde || filtHasta;
  const limpiar   = () => { setFiltModulo(''); setFiltUsuario(''); setFiltAccion(''); setFiltDesde(''); setFiltHasta(''); setPage(1); };

  const excelRows = () => filtered.map(r => ({
    'Fecha': r.fecha, 'Hora': r.hora, 'Usuario': r.usuario, 'Rol': r.rol,
    'Módulo': r.modulo, 'Acción': r.accion, 'Descripción': r.descripcion,
  }));

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
        <Header title="Trazabilidad del sistema" subtitle="Registro de acciones por usuario — solo coordinador" />

        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
          <select className="form-control form-control-sm" style={{ maxWidth: 160 }} value={filtModulo} onChange={e => { setFiltModulo(e.target.value); setPage(1); }}>
            <option value="">Todos los módulos</option>
            {MODULOS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="form-control form-control-sm" style={{ maxWidth: 160 }} value={filtUsuario} onChange={e => { setFiltUsuario(e.target.value); setPage(1); }}>
            <option value="">Todos los usuarios</option>
            {usuarios.map(u => <option key={u}>{u}</option>)}
          </select>
          <select className="form-control form-control-sm" style={{ maxWidth: 160 }} value={filtAccion} onChange={e => { setFiltAccion(e.target.value); setPage(1); }}>
            <option value="">Todas las acciones</option>
            {ACCIONES.map(a => <option key={a}>{a}</option>)}
          </select>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Desde</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 145 }} value={filtDesde} onChange={e => { setFiltDesde(e.target.value); setPage(1); }} />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Hasta</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 145 }} value={filtHasta} onChange={e => { setFiltHasta(e.target.value); setPage(1); }} />
          </div>
          {hayFiltro && (
            <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 20 }} onClick={limpiar}>
              <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle' }}>close</i> Limpiar
            </button>
          )}
          <div className="ml-auto">
            <ExcelButtons
              onExport={() => exportToExcel(excelRows(), 'trazabilidad', 'Trazabilidad')}
              onImport={() => {}}
              onExportPDF={() => exportToPDF(excelRows(), 'trazabilidad', 'Trazabilidad del sistema', 'Registro de acciones por usuario')}
              requiredCols={[]}
              canImport={false}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Fecha', 'Hora', 'Usuario', 'Rol', 'Módulo', 'Acción', 'Descripción'].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * 20, page * 20).map(r => (
                <tr key={r.id}>
                  <td style={{ color: C.gris, whiteSpace: 'nowrap' }}>{r.fecha}</td>
                  <td style={{ color: C.gris }}>{r.hora}</td>
                  <td style={{ fontWeight: 600, color: '#3D5170' }}>{r.usuario}</td>
                  <td>
                    <span style={{ ...ROL_COLOR[r.rol], fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {r.rol}
                    </span>
                  </td>
                  <td style={{ color: C.gris }}>{r.modulo}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                      color: r.accion.includes('creado') ? C.verde : r.accion.includes('editado') ? '#C8A84B' : C.gris,
                    }}>
                      {r.accion}
                    </span>
                  </td>
                  <td style={{ color: '#3D5170' }}>{r.descripcion}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4" style={{ color: C.gris }}>Sin registros para los filtros seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>
    </div>
  );
}
