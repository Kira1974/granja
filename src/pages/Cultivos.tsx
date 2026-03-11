import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { puedeCrear, puedeImportar, puedeExportar } from '@/constants/permisos';
import { cultivosService } from '@/services/cultivos.service';
import { C } from '@/constants/colors';
import { LOTES } from '@/constants/catalogos';
import type { ActividadCultivo, FormCultivo, Adjunto } from '@/types';
import { Btn, Modal, Input, Textarea, AdjuntosUpload, AdjuntosDisplay, ExcelButtons, Pagination } from '@/components/ui';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const FORM_INIT: FormCultivo = { lote: '', fecha: '', actividad: '', insumos: '', equipo: '', responsable: '', horaInicio: '', horaFin: '', observaciones: '' };

export default function CultivosPage() {
  const { user } = useAuth();
  const [items, setItems]         = useState<ActividadCultivo[]>([]);
  const [filtLote, setFiltLote]   = useState('');
  const [filtDesde, setFiltDesde] = useState('');
  const [filtHasta, setFiltHasta] = useState('');
  const [modal, setModal]         = useState(false);
  const [editando, setEditando]   = useState<ActividadCultivo | null>(null);
  const [detalle, setDetalle]     = useState<ActividadCultivo | null>(null);
  const [compModal, setCompModal] = useState<ActividadCultivo | null>(null);
  const [compTexto, setCompTexto] = useState('');
  const [form, setForm]           = useState<FormCultivo>(FORM_INIT);
  const [fotos, setFotos]         = useState<Adjunto[]>([]);
  const [docs, setDocs]           = useState<Adjunto[]>([]);
  const [saving, setSaving]       = useState(false);
  const [page, setPage]           = useState(1);

  useEffect(() => { cultivosService.getAll().then(setItems); }, []);

  const setField = (k: keyof FormCultivo) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleClose = () => { setModal(false); setEditando(null); setForm(FORM_INIT); setFotos([]); setDocs([]); };
  const abrirModal  = () => { setForm({ ...FORM_INIT, responsable: user?.nombre ?? '' }); setModal(true); };
  const abrirEditar = (a: ActividadCultivo) => {
    setEditando(a);
    setForm({ lote: a.lote, fecha: a.fecha, actividad: a.actividad, insumos: a.insumos.join(', '), equipo: a.equipo, responsable: a.responsable, horaInicio: a.horaInicio, horaFin: a.horaFin, observaciones: a.observaciones });
    setFotos(a.fotos.map(n => ({ nombre: n })));
    setDocs(a.documentos.map(n => ({ nombre: n })));
    setModal(true);
  };

  const filtered = items.filter(a => {
    if (filtLote && a.lote !== filtLote) return false;
    if (filtDesde && a.fecha < filtDesde) return false;
    if (filtHasta && a.fecha > filtHasta) return false;
    return true;
  });
  const paginated = filtered.slice((page - 1) * 20, page * 20);

  const guardar = async () => {
    if (!form.lote || !form.fecha || !form.actividad) return;
    setSaving(true);
    const payload = { ...form, fotos: fotos.map(f => f.nombre), documentos: docs.map(d => d.nombre) };
    if (editando) {
      const actualizado = await cultivosService.update(editando.id, payload);
      setItems(p => p.map(i => i.id === actualizado.id ? actualizado : i));
    } else {
      const nueva = await cultivosService.create(payload);
      setItems(p => [nueva, ...p]);
    }
    setSaving(false);
    handleClose();
  };

  const guardarComplemento = async () => {
    if (!compModal) return;
    const updated = await cultivosService.addComplemento(compModal.id, compTexto);
    setItems(p => p.map(i => i.id === updated.id ? updated : i));
    setCompModal(null);
    setDetalle(updated);
  };

  const handleExport = () => {
    exportToExcel(
      filtered.map(a => ({ 'Fecha': a.fecha, 'Lote': a.lote, 'Actividad': a.actividad, 'Insumos': a.insumos.join(', '), 'Equipo': a.equipo, 'Responsable': a.responsable, 'Hora inicio': a.horaInicio, 'Hora fin': a.horaFin, 'Observaciones': a.observaciones })),
      'cultivos',
      'Cultivos',
    );
  };

  const handleExportPDF = () => exportToPDF(
    filtered.map(a => ({ 'Fecha': a.fecha, 'Lote': a.lote, 'Actividad': a.actividad, 'Insumos': a.insumos.join(', '), 'Equipo': a.equipo, 'Responsable': a.responsable, 'Inicio': a.horaInicio, 'Fin': a.horaFin })),
    'cultivos', 'Trazabilidad de Cultivos', 'Registro de actividades por lote',
  );

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const nueva = await cultivosService.create({
        lote:          String(row['Lote']          ?? ''),
        fecha:         String(row['Fecha']         ?? ''),
        actividad:     String(row['Actividad']     ?? ''),
        insumos:       String(row['Insumos']       ?? ''),
        equipo:        String(row['Equipo']        ?? ''),
        responsable:   String(row['Responsable']   ?? ''),
        horaInicio:    String(row['Hora inicio']   ?? ''),
        horaFin:       String(row['Hora fin']      ?? ''),
        observaciones: String(row['Observaciones'] ?? ''),
        fotos: [], documentos: [],
      });
      setItems(p => [nueva, ...p]);
    }
  };

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
        <Header
          title="Trazabilidad de Cultivos"
          subtitle="Registro de actividades por lote — insumos, equipo, responsables y tiempos"
        />

        {/* Filtros */}
        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 10 }}>
          <select className="form-control form-control-sm" style={{ maxWidth: 220 }} value={filtLote} onChange={e => { setFiltLote(e.target.value); setPage(1); }}>
            <option value="">Todos los lotes</option>
            {LOTES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Desde</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtDesde} onChange={e => { setFiltDesde(e.target.value); setPage(1); }} />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <span style={{ fontSize: 11, color: '#818EA3', whiteSpace: 'nowrap' }}>Hasta</span>
            <input type="date" className="form-control form-control-sm" style={{ maxWidth: 150 }} value={filtHasta} onChange={e => { setFiltHasta(e.target.value); setPage(1); }} />
          </div>
          {(filtLote || filtDesde || filtHasta) && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setFiltLote(''); setFiltDesde(''); setFiltHasta(''); setPage(1); }}>
              <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle' }}>close</i> Limpiar
            </button>
          )}
          <div className="ml-auto d-flex" style={{ gap: 8 }}>
            <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Fecha','Lote','Actividad']} canExport={puedeExportar(user?.rol)} canImport={puedeImportar(user?.rol)} />
            {puedeCrear(user?.rol) && <Btn onClick={abrirModal}>+ Registrar actividad</Btn>}
          </div>
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Fecha', 'Lote', 'Actividad', 'Insumos', 'Equipo', 'Responsable', 'Tiempo', ''].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setDetalle(a)}>
                  <td style={{ color: C.gris }}>{a.fecha}</td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{a.lote.split('–')[0].trim()}</td>
                  <td>{a.actividad}</td>
                  <td style={{ fontSize: 12, color: C.gris }}>
                    {a.insumos.length > 0 ? a.insumos.slice(0, 2).join(', ') + (a.insumos.length > 2 ? '…' : '') : '—'}
                  </td>
                  <td style={{ fontSize: 12, color: C.gris }}>{a.equipo || '—'}</td>
                  <td style={{ fontSize: 12 }}>{a.responsable}</td>
                  <td style={{ fontSize: 12, color: C.gris }}>{a.horaInicio}–{a.horaFin}</td>
                  <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                    {(a.fotos.length > 0 || a.documentos.length > 0) && (
                      <i className="material-icons" style={{ fontSize: 14, color: '#818EA3' }}>attach_file</i>
                    )}
                    {a.complementoCoord && (
                      <i className="material-icons ml-1" style={{ fontSize: 14, color: C.verde }}>rate_review</i>
                    )}
                    {puedeCrear(user?.rol) && (
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
                    <i className="material-icons ml-1" style={{ fontSize: 18, color: '#818EA3' }}>chevron_right</i>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-4" style={{ color: C.gris, fontSize: 13 }}>Sin registros para los filtros seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>

      {/* Modal detalle */}
      {detalle && (
        <Modal title={`${detalle.actividad} — ${detalle.lote.split('–')[0].trim()}`} onClose={() => setDetalle(null)} maxWidth={620}>
          <div className="row mb-3">
            {[['Lote', detalle.lote], ['Fecha', detalle.fecha], ['Responsable', detalle.responsable], ['Tiempo', `${detalle.horaInicio} – ${detalle.horaFin}`]].map(([k, v]) => (
              <div key={k} className="col-6 mb-2">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, color: '#3D3D3D' }}>{v}</div>
              </div>
            ))}
          </div>

          {detalle.insumos.length > 0 && (
            <div className="mb-3">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', marginBottom: 4 }}>Insumos</div>
              <div style={{ fontSize: 13, color: '#3D3D3D' }}>{detalle.insumos.join(', ')}</div>
            </div>
          )}

          {detalle.equipo && (
            <div className="mb-3">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', marginBottom: 4 }}>Equipo / Maquinaria</div>
              <div style={{ fontSize: 13, color: '#3D3D3D' }}>{detalle.equipo}</div>
            </div>
          )}

          {detalle.observaciones && (
            <div className="mb-3" style={{ padding: '10px 12px', background: '#F0F7F4', borderRadius: 8, borderLeft: `3px solid ${C.verdeLight}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.verde, textTransform: 'uppercase', marginBottom: 4 }}>Observaciones</div>
              <div style={{ fontSize: 13, color: '#3D3D3D' }}>{detalle.observaciones}</div>
            </div>
          )}

          <AdjuntosDisplay fotos={detalle.fotos} documentos={detalle.documentos} />

          {detalle.complementoCoord ? (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#FFF8F0', borderRadius: 8, borderLeft: `3px solid ${C.tierraL}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.tierra, textTransform: 'uppercase', marginBottom: 4 }}>Complemento coordinador</div>
              <div style={{ fontSize: 13, color: '#3D3D3D' }}>{detalle.complementoCoord}</div>
            </div>
          ) : user?.rol === 'coordinador' && (
            <div className="mt-3">
              <Btn small variant="secondary" onClick={() => { setCompModal(detalle); setCompTexto(''); }}>
                + Agregar complemento
              </Btn>
            </div>
          )}
        </Modal>
      )}

      {/* Modal nueva actividad */}
      {modal && (
        <Modal title={editando ? 'Editar actividad en lote' : 'Registrar actividad en lote'} onClose={handleClose}>
          <div className="d-flex flex-column" style={{ gap: 12 }}>
            <div className="row">
              <div className="col-6"><Input label="Lote" value={form.lote} onChange={setField('lote')} options={[...LOTES]} required /></div>
              <div className="col-6"><Input label="Fecha" value={form.fecha} onChange={setField('fecha')} type="date" required /></div>
            </div>
            <Input label="Actividad" value={form.actividad} onChange={setField('actividad')} placeholder="Ej: Fertilización, Labranza..." required />
            <Input label="Insumos (separados por coma)" value={form.insumos} onChange={setField('insumos')} placeholder="Ej: DAP 50g/hoyo, Dual Gold 200ml" />
            <Input label="Equipo / Maquinaria" value={form.equipo} onChange={setField('equipo')} placeholder="Ej: Tractor, Manual, Fumigadora..." />
            <Input label="Responsable" value={form.responsable} onChange={setField('responsable')} readOnly />
            <div className="row">
              <div className="col-6"><Input label="Hora inicio" value={form.horaInicio} onChange={setField('horaInicio')} type="time" /></div>
              <div className="col-6"><Input label="Hora fin" value={form.horaFin} onChange={setField('horaFin')} type="time" /></div>
            </div>
            <Textarea label="Observaciones" value={form.observaciones} onChange={setField('observaciones')} placeholder="Condiciones del campo, novedades..." />
            <AdjuntosUpload fotos={fotos} setFotos={setFotos} documentos={docs} setDocumentos={setDocs} />
            <div className="d-flex justify-content-end" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving || !form.lote || !form.fecha || !form.actividad}>{saving ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal complemento */}
      {compModal && (
        <Modal title="Complemento del coordinador" onClose={() => setCompModal(null)}>
          <p style={{ fontSize: 13, color: C.gris }} className="mb-3">
            <strong>{compModal.actividad}</strong> — {compModal.lote}
          </p>
          <Textarea label="Observación del coordinador" value={compTexto} onChange={setCompTexto} placeholder="Recomendaciones, ajustes o anotaciones adicionales..." />
          <div className="d-flex justify-content-end mt-3" style={{ gap: 10 }}>
            <Btn variant="ghost" onClick={() => setCompModal(null)}>Cancelar</Btn>
            <Btn onClick={guardarComplemento}>Guardar complemento</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
