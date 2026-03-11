import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { zonasService } from '@/services/zonas.service';
import type { ZonaInfo } from '@/services/zonas.service';
import { C } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { Btn, Input, Modal } from '@/components/ui';
import { AdjuntosUpload } from '@/components/ui';
import type { Adjunto } from '@/types';
import Header from '@/components/layout/Header';

const TIPO_ICON: Record<string, string> = {
  lote: 'grass', estanque: 'water', invernadero: 'eco', isla: 'park',
};
const TIPO_LABEL: Record<string, string> = {
  lote: 'Lote productivo', estanque: 'Estanque / Reservorio', invernadero: 'Invernadero / Vivero', isla: 'Isla / Conservación',
};

// Gradients de muestra para el placeholder de galería
const SAMPLE_GRADIENTS = [
  '135deg,#1B4332,#52B788',
  '135deg,#2D6A4F,#95D5B2',
  '135deg,#386641,#A7C957',
  '135deg,#134E1B,#74C69D',
  '135deg,#3D5170,#7A96C2',
  '135deg,#7C2D12,#F97316',
];

export default function ZonasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCoord = user?.rol === 'coordinador';

  const [zonas, setZonas]       = useState<ZonaInfo[]>(zonasService.getAll());
  const [detalle, setDetalle]   = useState<ZonaInfo | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Lightbox
  const [lightbox, setLightbox]   = useState<string | null>(null);

  // Modal edición
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm]   = useState({ nombre: '', superficie: '', descripcion: '', detalle: '' });
  const [editFotos, setEditFotos] = useState<Adjunto[]>([]);
  const [saving, setSaving]       = useState(false);

  const tipos = ['lote', 'estanque', 'invernadero', 'isla'] as const;

  const filtered = zonas.filter(z => {
    if (filtroTipo && z.tipo !== filtroTipo) return false;
    if (busqueda && !z.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const abrirEditar = (z: ZonaInfo) => {
    setEditForm({ nombre: z.nombre, superficie: z.superficie ?? '', descripcion: z.descripcion ?? '', detalle: z.detalle ?? '' });
    setEditFotos(z.imagenes.map(n => ({ nombre: n })));
    setEditModal(true);
  };

  const guardar = () => {
    if (!detalle) return;
    setSaving(true);
    const actualizada = zonasService.update(detalle.id, {
      nombre:      editForm.nombre,
      superficie:  editForm.superficie || undefined,
      descripcion: editForm.descripcion || undefined,
      detalle:     editForm.detalle || undefined,
      imagenes:    editFotos.map(f => f.nombre),
    });
    setZonas(zonasService.getAll());
    setDetalle(actualizada);
    setSaving(false);
    setEditModal(false);
  };

  // ── Vista detalle ─────────────────────────────────────────────────────────────
  if (detalle) {
    const zona = zonas.find(z => z.id === detalle.id) ?? detalle;
    return (
      <div>
        <div className="main-content-container container-fluid py-4">
          {/* Breadcrumb */}
          <div className="d-flex align-items-center mb-3" style={{ gap: 6 }}>
            <button
              onClick={() => navigate(ROUTES.GRANJA)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#818EA3', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <i className="material-icons" style={{ fontSize: 14 }}>map</i>
              La Granja
            </button>
            <i className="material-icons" style={{ fontSize: 14, color: '#C8D2E0' }}>chevron_right</i>
            <button
              onClick={() => setDetalle(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#818EA3', padding: 0 }}
            >
              Zonas
            </button>
            <i className="material-icons" style={{ fontSize: 14, color: '#C8D2E0' }}>chevron_right</i>
            <span style={{ fontSize: 12, color: '#3D5170', fontWeight: 600 }}>{zona.nombre}</span>
          </div>

          {/* Cabecera de zona */}
          <div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${zona.color}DD, ${zona.color}88)`, padding: '28px 28px 22px' }}>
              <div className="d-flex align-items-flex-start" style={{ gap: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(4px)' }}>
                  <i className="material-icons" style={{ color: '#fff', fontSize: 34 }}>{TIPO_ICON[zona.tipo]}</i>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 22 }}>{zona.nombre}</h3>
                  <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                    <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                      <i className="material-icons" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 4 }}>{TIPO_ICON[zona.tipo]}</i>
                      {TIPO_LABEL[zona.tipo]}
                    </span>
                    {zona.superficie && (
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                        <i className="material-icons" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 4 }}>straighten</i>
                        {zona.superficie}
                      </span>
                    )}
                    {zona.imagenes.length > 0 && (
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                        <i className="material-icons" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 4 }}>photo_library</i>
                        {zona.imagenes.length} foto(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex" style={{ gap: 8 }}>
                  <button
                    onClick={() => navigate(ROUTES.GRANJA)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)' }}
                  >
                    <i className="material-icons" style={{ fontSize: 15 }}>map</i>
                    Ver en mapa
                  </button>
                  {isCoord && (
                    <button
                      onClick={() => abrirEditar(zona)}
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)' }}
                    >
                      <i className="material-icons" style={{ fontSize: 15 }}>edit</i>
                      Editar zona
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Columna principal */}
            <div className="col-12 col-lg-7 mb-4">
              {/* Descripción */}
              <div className="card mb-4" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Descripción</div>
                <p style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.85, marginBottom: 0 }}>
                  {zona.descripcion ?? 'Sin descripción registrada.'}
                </p>
              </div>

              {/* Detalles técnicos */}
              {zona.detalle && (
                <div className="card mb-4" style={{ padding: '1.25rem 1.5rem', borderLeft: `4px solid ${zona.color}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: zona.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    <i className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>biotech</i>
                    Datos técnicos
                  </div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.78, marginBottom: 0 }}>{zona.detalle}</p>
                </div>
              )}

              {/* Galería */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <i className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>photo_library</i>
                    Fotografías y multimedia
                  </div>
                  {isCoord && (
                    <button
                      onClick={() => abrirEditar(zona)}
                      style={{ background: 'none', border: `1px solid #E4E8EF`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: '#818EA3', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <i className="material-icons" style={{ fontSize: 13 }}>add_photo_alternate</i>
                      Agregar fotos
                    </button>
                  )}
                </div>

                {zona.imagenes.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {zona.imagenes.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setLightbox(img)}
                          style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E4E8EF', aspectRatio: '4/3', cursor: 'pointer', position: 'relative', background: '#F0FAF4' }}
                          onMouseEnter={e => ((e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '1')}
                          onMouseLeave={e => ((e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '0')}
                        >
                          {img.startsWith('http') ? (
                            <img src={img} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="material-icons" style={{ fontSize: 36, color: '#74C69D' }}>photo</i>
                              <div style={{ fontSize: 9, color: '#818EA3', marginTop: 4, padding: '0 6px', textAlign: 'center' }}>{img}</div>
                            </div>
                          )}
                          <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                            <i className="material-icons" style={{ color: '#fff', fontSize: 28 }}>zoom_in</i>
                          </div>
                        </div>
                      ))}
                    </div>
                    {lightbox && (
                      <div
                        onClick={() => setLightbox(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 20 }}
                      >
                        <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                          <i className="material-icons" style={{ fontSize: 32 }}>close</i>
                        </button>
                        <img src={lightbox} alt="Vista ampliada" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                      </div>
                    )}
                  </>

                ) : (
                  <div>
                    {/* Placeholder de muestra */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                      {[0,1,2,3,4,5].slice(0, 6).map(i => (
                        <div
                          key={i}
                          style={{ borderRadius: 10, background: `linear-gradient(${SAMPLE_GRADIENTS[i % SAMPLE_GRADIENTS.length]})`, aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.55 }}
                        >
                          <i className="material-icons" style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)' }}>photo_camera</i>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Vista {i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: '#818EA3', textAlign: 'center', marginBottom: 0 }}>
                      <i className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>info_outline</i>
                      {isCoord
                        ? 'Sin fotografías aún. Haz clic en "Editar zona" para agregar imágenes reales.'
                        : 'Sin fotografías registradas para esta zona aún.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna lateral */}
            <div className="col-12 col-lg-5 mb-4">
              {/* Info rápida */}
              <div className="card mb-4" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Información general</div>
                {[
                  { label: 'ID de zona', value: zona.id, icon: 'tag' },
                  { label: 'Tipo', value: TIPO_LABEL[zona.tipo], icon: TIPO_ICON[zona.tipo] },
                  { label: 'Superficie', value: zona.superficie ?? '—', icon: 'straighten' },
                  { label: 'Fotografías', value: `${zona.imagenes.length} registradas`, icon: 'photo_library' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="d-flex align-items-center" style={{ gap: 12, padding: '9px 0', borderBottom: '1px solid #F5F6F8' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: zona.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="material-icons" style={{ fontSize: 16, color: zona.color }}>{icon}</i>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#818EA3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#3D5170', fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actividades relacionadas */}
              <div className="card mb-4" style={{ padding: '1.25rem 1.5rem', background: '#FAFBFC' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Módulos relacionados</div>
                {[
                  { icon: 'grass', label: 'Cultivos', desc: 'Ver actividades de cultivo en esta zona', path: ROUTES.CULTIVOS, color: C.verde },
                  { icon: 'agriculture', label: 'Tractor', desc: 'Registros de uso de maquinaria', path: ROUTES.TRACTOR, color: '#92400E' },
                  { icon: 'local_gas_station', label: 'Combustibles', desc: 'Consumo de combustible asociado', path: ROUTES.COMBUSTIBLE, color: '#1E40AF' },
                ].map(m => (
                  <button
                    key={m.label}
                    onClick={() => navigate(m.path)}
                    style={{ width: '100%', background: '#fff', border: '1px solid #E4E8EF', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = m.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#E4E8EF')}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: m.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="material-icons" style={{ fontSize: 18, color: m.color }}>{m.icon}</i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#3D5170' }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: '#818EA3' }}>{m.desc}</div>
                    </div>
                    <i className="material-icons" style={{ fontSize: 16, color: '#C8D2E0', flexShrink: 0 }}>chevron_right</i>
                  </button>
                ))}
              </div>

              {/* Mapa enlace */}
              <div
                className="card"
                style={{ padding: '1.25rem', background: `linear-gradient(135deg, ${zona.color}18, ${zona.color}08)`, border: `1px solid ${zona.color}33`, cursor: 'pointer' }}
                onClick={() => navigate(ROUTES.GRANJA)}
              >
                <div className="d-flex align-items-center" style={{ gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: zona.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="material-icons" style={{ fontSize: 24, color: zona.color }}>satellite</i>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3D5170' }}>Ver en mapa satelital</div>
                    <div style={{ fontSize: 11, color: '#818EA3' }}>Ir al mapa interactivo de la granja</div>
                  </div>
                  <i className="material-icons" style={{ fontSize: 18, color: zona.color, marginLeft: 'auto' }}>arrow_forward</i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal edición */}
        {editModal && (
          <Modal title={`Editar zona — ${detalle.nombre}`} onClose={() => setEditModal(false)} maxWidth={560}>
            <div className="d-flex flex-column" style={{ gap: 14 }}>
              <div className="row">
                <div className="col-7"><Input label="Nombre" value={editForm.nombre} onChange={v => setEditForm(p => ({ ...p, nombre: v }))} /></div>
                <div className="col-5"><Input label="Superficie" value={editForm.superficie} onChange={v => setEditForm(p => ({ ...p, superficie: v }))} placeholder="Ej: ~2 ha" /></div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Descripción</div>
                <textarea
                  value={editForm.descripcion}
                  onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', border: '1px solid #E4E8EF', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3D5170', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Datos técnicos</div>
                <textarea
                  value={editForm.detalle}
                  onChange={e => setEditForm(p => ({ ...p, detalle: e.target.value }))}
                  rows={2}
                  placeholder="Ej: Sistema de riego, densidad de siembra, notas técnicas..."
                  style={{ width: '100%', border: '1px solid #E4E8EF', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3D5170', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <AdjuntosUpload fotos={editFotos} setFotos={setEditFotos} documentos={[]} setDocumentos={() => {}} />
              <div className="d-flex justify-content-end" style={{ gap: 10 }}>
                <Btn variant="ghost" onClick={() => setEditModal(false)}>Cancelar</Btn>
                <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Btn>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ── Vista lista ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="main-content-container container-fluid py-4">
        {/* Breadcrumb */}
        <div className="d-flex align-items-center mb-2" style={{ gap: 6 }}>
          <button
            onClick={() => navigate(ROUTES.GRANJA)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#818EA3', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <i className="material-icons" style={{ fontSize: 14 }}>map</i>
            La Granja
          </button>
          <i className="material-icons" style={{ fontSize: 14, color: '#C8D2E0' }}>chevron_right</i>
          <span style={{ fontSize: 12, color: '#3D5170', fontWeight: 600 }}>Zonas</span>
        </div>

        <Header title="Zonas de la Granja" subtitle="Gestión de lotes, estanques, vivero e islas de conservación" />

        {/* Filtros */}
        <div className="d-flex flex-wrap align-items-center mb-4" style={{ gap: 10 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
            <i className="material-icons" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#818EA3', pointerEvents: 'none' }}>search</i>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar zona..."
              className="form-control form-control-sm"
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div className="d-flex" style={{ gap: 6 }}>
            {(['', ...tipos] as const).map(t => (
              <button
                key={t || 'todos'}
                onClick={() => setFiltroTipo(t)}
                className={`btn btn-sm ${filtroTipo === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {t ? <><i className="material-icons" style={{ fontSize: 13 }}>{TIPO_ICON[t]}</i> {TIPO_LABEL[t].split(' ')[0]}</> : 'Todas'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#818EA3', marginLeft: 'auto' }}>{filtered.length} zonas</span>
        </div>

        {/* Grid de zonas */}
        <div className="row">
          {filtered.map(zona => (
            <div key={zona.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div
                className="card h-100"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onClick={() => setDetalle(zona)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
              >
                {/* Cabecera colorida */}
                <div style={{ background: `linear-gradient(135deg, ${zona.color}DD, ${zona.color}88)`, padding: '20px 20px 16px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                      <i className="material-icons" style={{ color: '#fff', fontSize: 26 }}>{TIPO_ICON[zona.tipo]}</i>
                    </div>
                    {zona.imagenes.length > 0 && (
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className="material-icons" style={{ fontSize: 11 }}>photo_camera</i>
                        {zona.imagenes.length}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{zona.nombre}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{TIPO_LABEL[zona.tipo]}</div>
                  </div>
                </div>

                {/* Cuerpo */}
                <div style={{ padding: '14px 16px' }}>
                  {zona.superficie && (
                    <div className="d-flex align-items-center mb-2" style={{ gap: 6 }}>
                      <i className="material-icons" style={{ fontSize: 14, color: '#818EA3' }}>straighten</i>
                      <span style={{ fontSize: 12, color: '#818EA3' }}>{zona.superficie}</span>
                    </div>
                  )}
                  {zona.descripcion && (
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {zona.descripcion}
                    </p>
                  )}
                  <div className="d-flex align-items-center justify-content-end mt-2" style={{ gap: 4 }}>
                    <span style={{ fontSize: 11, color: C.verde, fontWeight: 600 }}>Ver ficha completa</span>
                    <i className="material-icons" style={{ fontSize: 14, color: C.verde }}>arrow_forward</i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#818EA3' }}>
            <i className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>search_off</i>
            <div style={{ fontSize: 14 }}>No se encontraron zonas con ese criterio.</div>
          </div>
        )}
      </div>
    </div>
  );
}
