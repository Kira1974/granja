import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tractorService } from '@/services/tractor.service';
import { puedeCrear, puedeImportar, puedeExportar } from '@/constants/permisos';
import { C } from '@/constants/colors';
import type { RegistroTractor, FormTractor, Adjunto } from '@/types';
import { Btn, Modal, Input, Textarea, AdjuntosUpload, ExcelButtons, Pagination } from '@/components/ui';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const FORM_INIT: FormTractor = { fecha: '', actividad: '', horaInicio: '', horaFin: '', operario: '', observaciones: '' };

export default function TractorPage() {
  const { user } = useAuth();
  const [items, setItems]   = useState<RegistroTractor[]>([]);
  const [modal, setModal]     = useState(false);
  const [editando, setEditando] = useState<RegistroTractor | null>(null);
  const [form, setForm]       = useState<FormTractor>(FORM_INIT);
  const [fotos, setFotos]     = useState<Adjunto[]>([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage]     = useState(1);

  useEffect(() => { tractorService.getAll().then(setItems); }, []);

  const setField = (k: keyof FormTractor) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleClose = () => { setModal(false); setEditando(null); setForm(FORM_INIT); setFotos([]); };
  const abrirEditar = (r: RegistroTractor) => {
    setEditando(r);
    setForm({ fecha: r.fecha, actividad: r.actividad, horaInicio: r.horaInicio, horaFin: r.horaFin, operario: r.operario, observaciones: r.observaciones });
    setFotos(r.fotos.map(n => ({ nombre: n })));
    setModal(true);
  };

  const guardar = async () => {
    if (!form.fecha || !form.actividad) return;
    setSaving(true);
    const payload = { ...form, fotos: fotos.map(f => f.nombre) };
    if (editando) {
      const actualizado = await tractorService.update(editando.id, payload);
      setItems(p => p.map(i => i.id === actualizado.id ? actualizado : i));
    } else {
      const nuevo = await tractorService.create(payload);
      setItems(p => [nuevo, ...p]);
    }
    setSaving(false);
    handleClose();
  };

  const abrirModal = () => { setForm({ ...FORM_INIT, operario: user?.nombre ?? '' }); setModal(true); };

  const handleExport = () => {
    exportToExcel(
      items.map(i => ({ 'Fecha': i.fecha, 'Actividad': i.actividad, 'Hora inicio': i.horaInicio, 'Hora fin': i.horaFin, 'Total': i.total, 'Operario': i.operario, 'Observaciones': i.observaciones })),
      'tractor',
      'Tractor',
    );
  };

  const handleExportPDF = () => exportToPDF(
    items.map(i => ({ 'Fecha': i.fecha, 'Actividad': i.actividad, 'Inicio': i.horaInicio, 'Fin': i.horaFin, 'Total': i.total, 'Operario': i.operario, 'Observaciones': i.observaciones })),
    'tractor', 'Registro de Uso del Tractor', 'Planilla de actividades — Massey Ferguson 290',
  );

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const nuevo = await tractorService.create({
        fecha:        String(row['Fecha']        ?? ''),
        actividad:    String(row['Actividad']    ?? ''),
        horaInicio:   String(row['Hora inicio']  ?? ''),
        horaFin:      String(row['Hora fin']     ?? ''),
        operario:     String(row['Operario']     ?? ''),
        observaciones: String(row['Observaciones'] ?? ''),
        fotos: [],
      });
      setItems(p => [nuevo, ...p]);
    }
  };
  const totalPreview = form.horaInicio && form.horaFin ? tractorService.calcTotal(form.horaInicio, form.horaFin) : null;

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
      <Header title="Registro de Uso del Tractor" subtitle="Planilla de actividades — Massey Ferguson 290" />

        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Fecha','Actividad']} canExport={puedeExportar(user?.rol)} canImport={puedeImportar(user?.rol)} />
          {puedeCrear(user?.rol) && <Btn onClick={abrirModal}>+ Nuevo registro</Btn>}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Fecha', 'Actividad', 'Inicio', 'Fin', 'Total', 'Operario', 'Observaciones', 'Foto'].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.slice((page - 1) * 20, page * 20).map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.fecha}</td>
                  <td>{i.actividad}</td>
                  <td style={{ color: C.gris }}>{i.horaInicio}</td>
                  <td style={{ color: C.gris }}>{i.horaFin}</td>
                  <td style={{ fontWeight: 700, color: C.verde }}>{i.total}</td>
                  <td>{i.operario}</td>
                  <td style={{ color: C.gris, fontSize: 12 }}>{i.observaciones}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {i.fotos.length > 0
                      ? <i className="material-icons" style={{ fontSize: 16, color: C.verde }}>photo_camera</i>
                      : <span style={{ color: C.grisL }}>—</span>}
                    {puedeCrear(user?.rol) && (
                      <button
                        onClick={() => abrirEditar(i)}
                        title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: '#818EA3', borderRadius: 4, marginLeft: 4 }}
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
        <Pagination total={items.length} page={page} onChange={setPage} />
      </div>

      {modal && (
        <Modal title={editando ? 'Editar registro de tractor' : 'Nuevo registro de tractor'} onClose={handleClose}>
          <div className="d-flex flex-column" style={{ gap: 12 }}>
            <Input label="Fecha" value={form.fecha} onChange={setField('fecha')} type="date" required />
            <Input label="Actividad" value={form.actividad} onChange={setField('actividad')} placeholder="Ej: Labranza primaria Lote E2" required />
            <Input label="Operario" value={form.operario} onChange={setField('operario')} readOnly />
            <div className="row">
              <div className="col-6"><Input label="Hora inicio" value={form.horaInicio} onChange={setField('horaInicio')} type="time" /></div>
              <div className="col-6"><Input label="Hora fin"    value={form.horaFin}    onChange={setField('horaFin')}    type="time" /></div>
            </div>
            {totalPreview && totalPreview !== '—' && (
              <div className="alert alert-success mb-0 py-2" style={{ fontSize: 13 }}>
                <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>schedule</i>
                Total calculado: <strong>{totalPreview}</strong>
              </div>
            )}
            <Textarea label="Observaciones" value={form.observaciones} onChange={setField('observaciones')} placeholder="Novedades mecánicas, condiciones del terreno..." />
            <AdjuntosUpload fotos={fotos} setFotos={setFotos} documentos={[]} setDocumentos={() => {}} />
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
