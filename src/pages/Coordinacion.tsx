import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { coordinacionService } from '@/services/coordinacion.service';
import { C } from '@/constants/colors';
import { CATEGORIAS_COORD } from '@/constants/catalogos';
import type { ActividadCoord, FormCoord, Adjunto } from '@/types';
import { Badge, Btn, Modal, Input, Textarea, AdjuntosUpload, AdjuntosDisplay, ExcelButtons, Pagination } from '@/components/ui';
import { puedeImportar, puedeExportar } from '@/constants/permisos';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const FORM_INIT: FormCoord = { fecha: '', categoria: '', descripcion: '' };

export default function CoordinacionPage() {
  const { user } = useAuth();
  const [items, setItems]       = useState<ActividadCoord[]>([]);
  const [modal, setModal]       = useState(false);
  const [editando, setEditando] = useState<ActividadCoord | null>(null);
  const [detalle, setDetalle]   = useState<ActividadCoord | null>(null);
  const [form, setForm]         = useState<FormCoord>(FORM_INIT);
  const [fotos, setFotos]       = useState<Adjunto[]>([]);
  const [docs, setDocs]         = useState<Adjunto[]>([]);
  const [saving, setSaving]     = useState(false);
  const [filtCat, setFiltCat]   = useState('');
  const [filtDesde, setFiltDesde] = useState('');
  const [filtHasta, setFiltHasta] = useState('');
  const [page, setPage]         = useState(1);

  useEffect(() => { coordinacionService.getAll().then(setItems); }, []);

  const setField = (k: keyof FormCoord) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleClose = () => { setModal(false); setEditando(null); setForm(FORM_INIT); setFotos([]); setDocs([]); };

  const abrirEditar = (a: ActividadCoord) => {
    setEditando(a);
    setForm({ fecha: a.fecha, categoria: a.categoria, descripcion: a.descripcion });
    setFotos(a.fotos.map(n => ({ nombre: n })));
    setDocs(a.documentos.map(n => ({ nombre: n })));
    setModal(true);
  };

  const guardar = async () => {
    if (!form.fecha || !form.categoria || !form.descripcion) return;
    setSaving(true);
    const payload = { ...form, responsable: user!.nombre, fotos: fotos.map(f => f.nombre), documentos: docs.map(d => d.nombre) };
    if (editando) {
      const actualizado = await coordinacionService.update(editando.id, payload);
      setItems(p => p.map(i => i.id === actualizado.id ? actualizado : i));
    } else {
      const nueva = await coordinacionService.create(payload);
      setItems(p => [nueva, ...p]);
    }
    setSaving(false);
    handleClose();
  };

  const filtered = items.filter(a => {
    if (filtCat && a.categoria !== filtCat) return false;
    if (filtDesde && a.fecha < filtDesde) return false;
    if (filtHasta && a.fecha > filtHasta) return false;
    return true;
  });

  const canEdit = user?.rol === 'coordinador' || user?.rol === 'mayordomo';

  const handleExport = () => {
    exportToExcel(
      items.map(a => ({ 'Fecha': a.fecha, 'Categoría': a.categoria, 'Descripción': a.descripcion, 'Responsable': a.responsable })),
      'coordinacion',
      'Coordinación',
    );
  };

  const pdfRows = () => items.map(a => ({ 'Fecha': a.fecha, 'Categoría': a.categoria, 'Descripción': a.descripcion, 'Responsable': a.responsable }));
  const handleExportPDF = () => exportToPDF(pdfRows(), 'coordinacion', 'Registro de Coordinación', 'Actividades registradas por el coordinador de la Granja Experimental');

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const nueva = await coordinacionService.create({
        fecha:       String(row['Fecha']       ?? ''),
        categoria:   String(row['Categoría']   ?? ''),
        descripcion: String(row['Descripción'] ?? ''),
        responsable: user?.nombre ?? '',
        fotos: [], documentos: [],
      });
      setItems(p => [nueva, ...p]);
    }
  };

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
        <Header
          title="Registro de Coordinación"
          subtitle="Actividades registradas por el coordinador de la Granja Experimental"
        />

        {/* Filtros */}
        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 10 }}>
          <select
            className="form-control form-control-sm"
            style={{ maxWidth: 200 }}
            value={filtCat}
            onChange={e => { setFiltCat(e.target.value); setPage(1); }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_COORD.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Desde</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtDesde} onChange={e => { setFiltDesde(e.target.value); setPage(1); }} />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Hasta</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtHasta} onChange={e => { setFiltHasta(e.target.value); setPage(1); }} />
          </div>
          {(filtCat || filtDesde || filtHasta) && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => { setFiltCat(''); setFiltDesde(''); setFiltHasta(''); setPage(1); }}
            >
              <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle' }}>close</i> Limpiar
            </button>
          )}
          <div className="ml-auto d-flex" style={{ gap: 8 }}>
            <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Fecha','Categoría','Descripción']} canExport={puedeExportar(user?.rol)} canImport={puedeImportar(user?.rol)} />
            {canEdit && <Btn onClick={() => setModal(true)}>+ Nueva actividad</Btn>}
          </div>
        </div>

        {/* Lista compacta */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                <th style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, width: 110 }}>Fecha</th>
                <th style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, width: 180 }}>Categoría</th>
                <th style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Descripción</th>
                <th style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, width: 100 }}>Responsable</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * 20, page * 20).map(a => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setDetalle(a)}>
                  <td style={{ color: C.gris }}>{a.fecha}</td>
                  <td><Badge label={a.categoria} /></td>
                  <td style={{ color: '#3D5170' }}>
                    {a.descripcion.length > 80 ? a.descripcion.slice(0, 80) + '…' : a.descripcion}
                    {(a.fotos.length > 0 || a.documentos.length > 0) && (
                      <i className="material-icons ml-2" style={{ fontSize: 14, color: '#818EA3', verticalAlign: 'middle' }}>attach_file</i>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: C.gris }}>{a.responsable}</td>
                  <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                    {canEdit && (
                      <button
                        onClick={() => abrirEditar(a)}
                        title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: '#818EA3', borderRadius: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#3D5170')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#818EA3')}
                      >
                        <i className="material-icons" style={{ fontSize: 16 }}>edit</i>
                      </button>
                    )}
                    <i className="material-icons" style={{ fontSize: 18, color: '#818EA3', verticalAlign: 'middle' }}>chevron_right</i>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4" style={{ color: C.gris, fontSize: 13 }}>Sin registros para los filtros seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>

      {/* Modal detalle */}
      {detalle && (
        <Modal title="" onClose={() => setDetalle(null)} maxWidth={720}>
          {/* Header del detalle */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F0F2F5' }}>
            <div style={{ flex: 1 }}>
              <div className="d-flex align-items-center flex-wrap" style={{ gap: 8, marginBottom: 8 }}>
                <Badge label={detalle.categoria} />
                {(detalle.fotos.length > 0 || detalle.documentos.length > 0) && (
                  <span style={{ fontSize: 11, color: '#818EA3', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="material-icons" style={{ fontSize: 13 }}>attach_file</i>
                    {detalle.fotos.length > 0 && `${detalle.fotos.length} foto(s)`}
                    {detalle.fotos.length > 0 && detalle.documentos.length > 0 && ' · '}
                    {detalle.documentos.length > 0 && `${detalle.documentos.length} doc(s)`}
                  </span>
                )}
              </div>
              <div className="d-flex flex-wrap" style={{ gap: 16 }}>
                {[['Fecha', detalle.fecha], ['Responsable', detalle.responsable]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#3D5170', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Descripción de la actividad</div>
            <p style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.78, marginBottom: 0, background: '#FAFBFC', borderRadius: 8, padding: '12px 14px', border: '1px solid #F0F2F5' }}>
              {detalle.descripcion}
            </p>
          </div>

          {/* Adjuntos */}
          <AdjuntosDisplay fotos={detalle.fotos} documentos={detalle.documentos} />
        </Modal>
      )}

      {/* Modal nueva actividad */}
      {modal && (
        <Modal title={editando ? 'Editar actividad de coordinación' : 'Nueva actividad de coordinación'} onClose={handleClose}>
          <div className="d-flex flex-column" style={{ gap: 14 }}>
            <div className="row">
              <div className="col-6"><Input label="Fecha" value={form.fecha} onChange={setField('fecha')} type="date" required /></div>
              <div className="col-6"><Input label="Categoría" value={form.categoria} onChange={setField('categoria')} options={CATEGORIAS_COORD} required /></div>
            </div>
            <Textarea
              label="Descripción de la actividad"
              value={form.descripcion}
              onChange={setField('descripcion')}
              placeholder="Describa detalladamente la actividad realizada..."
              rows={4}
            />
            <AdjuntosUpload fotos={fotos} setFotos={setFotos} documentos={docs} setDocumentos={setDocs} />
            <div className="d-flex justify-content-end" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving || !form.fecha || !form.categoria || !form.descripcion}>
                {saving ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar actividad'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
