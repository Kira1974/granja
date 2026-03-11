import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { combustibleService } from '@/services/combustible.service';
import { C } from '@/constants/colors';
import { TIPOS_COMBUSTIBLE } from '@/constants/catalogos';
import { MOCK_USUARIOS } from '@/constants/mockData';
import type { RegistroCombustible, FormCombustible, TipoCombustible } from '@/types';
import { Btn, Modal, Input, ExcelButtons, Pagination } from '@/components/ui';
import { puedeCrear, puedeImportar, puedeExportar } from '@/constants/permisos';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const FORM_INIT: FormCombustible = { tipo: 'ACPM', fecha: '', concepto: '', actividad: '', vigilante: '', lecturaCm: '', lecturaGal: '', operario: '' };

export default function CombustiblesPage() {
  const { user } = useAuth();
  const [items, setItems]   = useState<RegistroCombustible[]>([]);
  const [filtro, setFiltro] = useState<string>('todos');
  const [filtDesde, setFiltDesde] = useState('');
  const [filtHasta, setFiltHasta] = useState('');
  const [modal, setModal]     = useState(false);
  const [editando, setEditando] = useState<RegistroCombustible | null>(null);
  const [page, setPage]       = useState(1);
  const [form, setForm]       = useState<FormCombustible>(FORM_INIT);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { combustibleService.getAll().then(setItems); }, []);

  const setField = (k: keyof FormCombustible) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const filtered = items.filter(i => {
    if (filtro !== 'todos' && i.tipo !== filtro) return false;
    if (filtDesde && i.fecha < filtDesde) return false;
    if (filtHasta && i.fecha > filtHasta) return false;
    return true;
  });
  const handleClose = () => { setModal(false); setEditando(null); setForm(FORM_INIT); };
  const abrirEditar = (r: RegistroCombustible) => {
    setEditando(r);
    setForm({ tipo: r.tipo, fecha: r.fecha, concepto: r.concepto, actividad: r.actividad, vigilante: r.vigilante, lecturaCm: r.lecturaCm, lecturaGal: r.lecturaGal, operario: r.operario });
    setModal(true);
  };

  const handleExport = () => {
    exportToExcel(
      filtered.map(i => ({ 'Tipo': i.tipo, 'Fecha': i.fecha, 'Concepto': i.concepto, 'Actividad': i.actividad, 'Vigilante': i.vigilante, 'Lectura (cm)': i.lecturaCm, 'Lectura (gal)': i.lecturaGal, 'Operario': i.operario })),
      'combustibles',
      'Combustibles',
    );
  };

  const handleExportPDF = () => exportToPDF(
    filtered.map(i => ({ 'Tipo': i.tipo, 'Fecha': i.fecha, 'Concepto': i.concepto, 'Actividad': i.actividad, 'Vigilante': i.vigilante, 'cm': i.lecturaCm, 'Gal': i.lecturaGal, 'Operario': i.operario })),
    'combustibles', 'Registro de Combustibles', 'ACPM y gasolina mezclada — lecturas de tanque y trazabilidad',
  );

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const nuevo = await combustibleService.create({
        tipo:       (String(row['Tipo'] ?? 'ACPM')) as TipoCombustible,
        fecha:      String(row['Fecha']          ?? ''),
        concepto:   String(row['Concepto']       ?? ''),
        actividad:  String(row['Actividad']      ?? ''),
        vigilante:  String(row['Vigilante']      ?? ''),
        lecturaCm:  String(row['Lectura (cm)']   ?? ''),
        lecturaGal: String(row['Lectura (gal)']  ?? ''),
        operario:   String(row['Operario']       ?? ''),
      });
      setItems(p => [nuevo, ...p]);
    }
  };

  const guardar = async () => {
    if (!form.fecha || !form.actividad) return;
    setSaving(true);
    if (editando) {
      const actualizado = await combustibleService.update(editando.id, form);
      setItems(p => p.map(i => i.id === actualizado.id ? actualizado : i));
    } else {
      const nuevo = await combustibleService.create(form);
      setItems(p => [nuevo, ...p]);
    }
    setSaving(false);
    handleClose();
  };

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
      <Header title="Registro de Combustibles" subtitle="ACPM y gasolina mezclada — lecturas de tanque y trazabilidad" />

        {/* Filtros */}
        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
          {(['todos', ...TIPOS_COMBUSTIBLE] as const).map(t => (
            <button
              key={t}
              onClick={() => { setFiltro(t); setPage(1); }}
              className={`btn btn-sm ${filtro === t ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ borderRadius: 20 }}
            >
              {t === 'todos' ? 'Todos' : t}
            </button>
          ))}
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Desde</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtDesde} onChange={e => { setFiltDesde(e.target.value); setPage(1); }} />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Hasta</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtHasta} onChange={e => { setFiltHasta(e.target.value); setPage(1); }} />
          </div>
          {(filtDesde || filtHasta) && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setFiltDesde(''); setFiltHasta(''); setPage(1); }}>
              <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle' }}>close</i> Limpiar fechas
            </button>
          )}
          <div className="ml-auto d-flex" style={{ gap: 8 }}>
            <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Tipo','Fecha','Actividad']} canExport={puedeExportar(user?.rol)} canImport={puedeImportar(user?.rol)} />
            {puedeCrear(user?.rol) && <Btn onClick={() => setModal(true)}>+ Nuevo registro</Btn>}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Fecha', 'Tipo', 'Concepto', 'Actividad', 'Vigilante', 'cm', 'Gal', 'Operario'].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * 20, page * 20).map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.fecha}</td>
                  <td>
                    <span style={{
                      background: i.tipo === 'ACPM' ? '#DBEAFE' : '#FEF3C7',
                      color: i.tipo === 'ACPM' ? '#1E40AF' : '#92400E',
                      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {i.tipo}
                    </span>
                  </td>
                  <td>{i.concepto}</td>
                  <td style={{ color: C.gris }}>{i.actividad}</td>
                  <td style={{ color: C.gris }}>{i.vigilante}</td>
                  <td style={{ fontWeight: 700 }}>{i.lecturaCm}</td>
                  <td style={{ fontWeight: 700, color: C.verde }}>{i.lecturaGal}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {i.operario}
                    {puedeCrear(user?.rol) && (
                      <button
                        onClick={() => abrirEditar(i)}
                        title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: '#818EA3', borderRadius: 4, marginLeft: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#3D5170')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#818EA3')}
                      >
                        <i className="material-icons" style={{ fontSize: 16 }}>edit</i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>

      {modal && (
        <Modal title={editando ? 'Editar registro de combustible' : 'Nuevo registro de combustible'} onClose={handleClose}>
          <div className="d-flex flex-column" style={{ gap: 12 }}>
            <div className="row">
              <div className="col-6"><Input label="Tipo" value={form.tipo} onChange={v => setForm(p => ({ ...p, tipo: v as TipoCombustible }))} options={[...TIPOS_COMBUSTIBLE]} /></div>
              <div className="col-6"><Input label="Fecha" value={form.fecha} onChange={setField('fecha')} type="date" required /></div>
            </div>
            <Input label="Concepto" value={form.concepto} onChange={setField('concepto')} placeholder="Ej: Carga tractor" />
            <Input label="Actividad relacionada" value={form.actividad} onChange={setField('actividad')} placeholder="Ej: Labranza E2" required />
            <Input label="Vigilante de turno" value={form.vigilante} onChange={setField('vigilante')} placeholder="Nombre del vigilante" />
            <div className="row">
              <div className="col-6"><Input label="Lectura (cm)"  value={form.lecturaCm}  onChange={setField('lecturaCm')}  type="number" placeholder="0" /></div>
              <div className="col-6"><Input label="Lectura (gal)" value={form.lecturaGal} onChange={setField('lecturaGal')} type="number" placeholder="0.0" /></div>
            </div>
            <Input label="Operario" value={form.operario} onChange={setField('operario')} options={MOCK_USUARIOS.map(u => u.nombre)} />
            <div className="d-flex justify-content-end" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving || !form.fecha || !form.actividad}>{saving ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
