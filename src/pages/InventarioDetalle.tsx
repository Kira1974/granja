import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { inventarioService } from '@/services/inventario.service';
import { puedeEditarInventario } from '@/constants/permisos';
import { C } from '@/constants/colors';
import { ESTADOS_ITEM } from '@/constants/catalogos';
import { ROUTES } from '@/constants/routes';
import { Badge, Btn, Input } from '@/components/ui';
import Header from '@/components/layout/Header';
import type { ItemInventario, MovimientoInventario, EstadoItem } from '@/types';

const ACCION_COLOR: Record<string, string> = {
  'Ingreso al inventario': C.verde,
  'Uso en campo':          C.tierra,
  'Mantenimiento':         '#C8A84B',
  'Baja':                  '#8B1A1A',
};

type EditForm = {
  nombre: string;
  codigo: string;
  proveedor: string;
  unidad: string;
  cantidad: string;
  stockMinimo: string;
  estado: EstadoItem;
  categoria: string;
  foto: string | null;
};

export default function InventarioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem]       = useState<ItemInventario | null>(null);
  const [movs, setMovs]       = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<EditForm | null>(null);
  const [lightbox, setLightbox]   = useState(false);
  const fotoRef                   = useRef<HTMLInputElement>(null);

  // Filtros y orden de movimientos
  const [filtAccion, setFiltAccion] = useState('');
  const [filtDesde, setFiltDesde]   = useState('');
  const [filtHasta, setFiltHasta]   = useState('');
  const [orden, setOrden]           = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    Promise.all([
      inventarioService.getById(numId),
      inventarioService.getMovimientos(numId),
    ]).then(([i, m]) => {
      setItem(i ?? null);
      setMovs(m);
      setLoading(false);
    });
  }, [id]);

  const startEdit = () => {
    if (!item) return;
    setForm({
      nombre:     item.nombre,
      codigo:     item.codigo     ?? '',
      proveedor:  item.proveedor  ?? '',
      unidad:     item.unidad,
      cantidad:   String(item.cantidad),
      stockMinimo: item.stockMinimo != null ? String(item.stockMinimo) : '',
      estado:     item.estado,
      categoria:  item.categoria,
      foto:       item.foto ?? null,
    });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setForm(null); };

  const guardar = async () => {
    if (!item || !form) return;
    setSaving(true);
    const updated = await inventarioService.update(item.id, {
      nombre:     form.nombre,
      codigo:     form.codigo     || undefined,
      proveedor:  form.proveedor  || undefined,
      unidad:     form.unidad,
      cantidad:   Number(form.cantidad),
      stockMinimo: form.stockMinimo ? Number(form.stockMinimo) : undefined,
      estado:     form.estado,
      categoria:  form.categoria,
      foto:       form.foto,
    });
    setItem(updated);
    setSaving(false);
    setEditing(false);
    setForm(null);
  };

  const setF = (k: keyof EditForm) => (v: string) =>
    setForm(p => p ? { ...p, [k]: v } : p);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(p => p ? { ...p, foto: ev.target?.result as string } : p);
    reader.readAsDataURL(file);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: '#818EA3', textTransform: 'uppercase',
    fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4,
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 14, fontWeight: 500, color: '#3D5170',
    padding: '6px 0', borderBottom: '1px solid #E4E8EF',
  };

  if (loading) {
    return (
      <div className="main-content-container container-fluid py-4">
        <p style={{ color: C.gris, padding: '2rem' }}>Cargando…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="main-content-container container-fluid py-4">
        <p style={{ color: '#8B1A1A', padding: '2rem' }}>Ítem no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="main-content-container container-fluid py-4">

        {/* Botón atrás + breadcrumb */}
        <div className="d-flex align-items-center mb-1" style={{ gap: 6 }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => navigate(ROUTES.INVENTARIO)}
          >
            <i className="material-icons" style={{ fontSize: 18 }}>arrow_back</i>
          </button>
          <i className="material-icons" style={{ fontSize: 14, color: C.gris }}>chevron_right</i>
          <span style={{ fontSize: 13, color: C.gris }}>Hoja de vida</span>
        </div>

        <Header
          title={item.nombre}
          subtitle={`${item.categoria} · ${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}`}
        />

        {/* Ficha del ítem */}
        <div className="card mb-4" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gris, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Información general
            </div>
            {!editing && puedeEditarInventario(user?.rol) && (
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ borderRadius: 20, fontSize: 12 }}
                onClick={startEdit}
              >
                <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>edit</i>
                Editar
              </button>
            )}
          </div>

          {editing && form ? (
            <>
              {/* Zona de foto en edición */}
              <div
                onClick={() => fotoRef.current?.click()}
                style={{
                  border: `2px dashed ${form.foto ? C.verdeMid : C.grisL}`,
                  borderRadius: 10,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: form.foto ? '#F0FAF4' : '#FAFAFA',
                  marginBottom: 16,
                  transition: 'all 0.15s',
                }}
              >
                {form.foto ? (
                  <img
                    src={form.foto}
                    alt=""
                    onClick={e => { e.stopPropagation(); setLightbox(true); }}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'zoom-in' }}
                  />
                ) : (
                  <i className="material-icons" style={{ fontSize: 32, color: C.grisL }}>add_photo_alternate</i>
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.foto ? C.verde : C.gris }}>
                    {form.foto ? 'Imagen adjunta · clic para cambiar' : 'Agregar imagen del ítem'}
                  </div>
                  <div style={{ fontSize: 11, color: C.gris }}>JPG, PNG — opcional</div>
                </div>
                {form.foto && (
                  <button
                    className="btn btn-sm"
                    style={{ marginLeft: 'auto', color: '#8B1A1A', background: 'none', border: 'none', padding: 0 }}
                    onClick={e => { e.stopPropagation(); setForm(p => p ? { ...p, foto: null } : p); }}
                  >
                    <i className="material-icons" style={{ fontSize: 18 }}>delete</i>
                  </button>
                )}
              </div>
              <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <Input label="Nombre" value={form.nombre} onChange={setF('nombre')} required />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <Input label="Código" value={form.codigo} onChange={setF('codigo')} placeholder="Ej: INS-001" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <Input label="Categoría" value={form.categoria} onChange={setF('categoria')} />
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <Input label="Proveedor" value={form.proveedor} onChange={setF('proveedor')} placeholder="Nombre del proveedor" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <Input label="Unidad" value={form.unidad} onChange={setF('unidad')} placeholder="Litros / Kilos…" />
                </div>
                {item.tipo !== 'maquinaria' && (
                  <>
                    <div className="col-6 col-md-3 mb-3">
                      <Input label="Stock actual" value={form.cantidad} onChange={setF('cantidad')} type="number" />
                    </div>
                    <div className="col-6 col-md-3 mb-3">
                      <Input label="Stock mínimo" value={form.stockMinimo} onChange={setF('stockMinimo')} type="number" />
                    </div>
                  </>
                )}
                <div className="col-6 col-md-3 mb-3">
                  <Input label="Estado" value={form.estado} onChange={v => setF('estado')(v)} options={[...ESTADOS_ITEM]} />
                </div>
              </div>
              <div className="d-flex justify-content-end" style={{ gap: 10, marginTop: 4 }}>
                <Btn variant="ghost" onClick={cancelEdit}>Cancelar</Btn>
                <Btn onClick={guardar} disabled={saving || !form.nombre}>{saving ? 'Guardando…' : 'Guardar cambios'}</Btn>
              </div>
            </>
          ) : (
            <div className="row">
              {item.foto && (
                <div className="col-12 mb-3">
                  <img
                    src={item.foto}
                    alt={item.nombre}
                    onClick={() => setLightbox(true)}
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid #E4E8EF', cursor: 'zoom-in' }}
                  />
                </div>
              )}
              <div className="col-12 col-md-6 mb-3">
                <div style={labelStyle}>Nombre</div>
                <div style={valueStyle}>{item.nombre}</div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div style={labelStyle}>Código</div>
                <div style={valueStyle}>{item.codigo ?? '—'}</div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div style={labelStyle}>Categoría</div>
                <div style={valueStyle}>{item.categoria}</div>
              </div>
              <div className="col-12 col-md-6 mb-3">
                <div style={labelStyle}>Proveedor</div>
                <div style={valueStyle}>{item.proveedor ?? '—'}</div>
              </div>
              <div className="col-6 col-md-3 mb-3">
                <div style={labelStyle}>Unidad</div>
                <div style={valueStyle}>{item.unidad}</div>
              </div>
              {item.tipo !== 'maquinaria' && (
                <>
                  <div className="col-6 col-md-3 mb-3">
                    <div style={labelStyle}>Stock actual</div>
                    <div style={valueStyle}>{item.cantidad}</div>
                  </div>
                  <div className="col-6 col-md-3 mb-3">
                    <div style={labelStyle}>Stock mínimo</div>
                    <div style={valueStyle}>{item.stockMinimo ?? '—'}</div>
                  </div>
                </>
              )}
              <div className="col-6 col-md-3 mb-3">
                <div style={labelStyle}>Estado</div>
                <div style={{ marginTop: 4 }}><Badge label={item.estado} /></div>
              </div>
            </div>
          )}
        </div>

        {/* Controles trazabilidad */}
        {(() => {
          const accionesUnicas = Array.from(new Set(movs.map(m => m.accion)));
          const hayFiltro = filtAccion || filtDesde || filtHasta;

          const filtered = movs
            .filter(m => {
              if (filtAccion && m.accion !== filtAccion) return false;
              if (filtDesde  && m.fecha < filtDesde)    return false;
              if (filtHasta  && m.fecha > filtHasta)    return false;
              return true;
            })
            .sort((a, b) =>
              orden === 'desc'
                ? b.fecha.localeCompare(a.fecha)
                : a.fecha.localeCompare(b.fecha),
            );

          return (
            <>
              {/* Título */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3D5170', marginBottom: 10 }}>
                Trazabilidad de movimientos
                <span style={{ marginLeft: 8, fontSize: 12, color: C.gris, fontWeight: 400 }}>
                  ({filtered.length}{filtered.length !== movs.length ? ` de ${movs.length}` : ''} registro{movs.length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Controles en fila completa */}
              <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
                {/* Orden */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderRadius: 20, fontSize: 12, whiteSpace: 'nowrap' }}
                  onClick={() => setOrden(o => o === 'desc' ? 'asc' : 'desc')}
                >
                  <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>
                    {orden === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                  </i>
                  {orden === 'desc' ? 'Más recientes' : 'Más antiguos'}
                </button>

                {/* Filtro acción */}
                <select
                  className="form-control form-control-sm"
                  style={{ flex: '1 1 160px', maxWidth: 200 }}
                  value={filtAccion}
                  onChange={e => setFiltAccion(e.target.value)}
                >
                  <option value="">Todas las acciones</option>
                  {accionesUnicas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                {/* Desde */}
                <input
                  type="date"
                  className="form-control form-control-sm"
                  style={{ flex: '1 1 130px', maxWidth: 160 }}
                  value={filtDesde}
                  onChange={e => setFiltDesde(e.target.value)}
                  title="Desde"
                />

                {/* Hasta */}
                <input
                  type="date"
                  className="form-control form-control-sm"
                  style={{ flex: '1 1 130px', maxWidth: 160 }}
                  value={filtHasta}
                  onChange={e => setFiltHasta(e.target.value)}
                  title="Hasta"
                />

                {hayFiltro && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => { setFiltAccion(''); setFiltDesde(''); setFiltHasta(''); }}
                  >
                    <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle' }}>close</i> Limpiar
                  </button>
                )}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table mb-0">
                  <thead className="thead-light">
                    <tr>
                      {['Fecha', 'Acción', 'Actividad', 'Responsable', 'Vigilante', 'Cantidad', 'Stock antes', 'Stock después'].map(h => (
                        <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontSize: 13, color: C.gris, whiteSpace: 'nowrap' }}>{m.fecha}</td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: ACCION_COLOR[m.accion] ?? C.gris,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}>
                            {m.accion}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#3D5170' }}>{m.actividad}</td>
                        <td style={{ fontSize: 12, color: C.gris }}>{m.responsable}</td>
                        <td style={{ fontSize: 12, color: C.gris }}>{m.vigilante}</td>
                        <td style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                          {item.tipo === 'maquinaria' ? '—' : m.cantidadMovida}
                        </td>
                        <td style={{ fontSize: 13, textAlign: 'center', color: C.gris }}>
                          {item.tipo === 'maquinaria' ? '—' : m.stockAntes}
                        </td>
                        <td style={{ fontSize: 13, textAlign: 'center', fontWeight: 600, color: '#3D5170' }}>
                          {item.tipo === 'maquinaria' ? '—' : m.stockDespues}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-4" style={{ color: C.gris, fontSize: 13 }}>
                          Sin registros para los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

      </div>

      {/* Lightbox */}
      {lightbox && (item.foto || form?.foto) && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={(editing ? form?.foto : item.foto) ?? ''}
            alt={item.nombre}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', objectFit: 'contain' }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
          >
            <i className="material-icons" style={{ fontSize: 32 }}>close</i>
          </button>
        </div>
      )}
    </div>
  );
}
