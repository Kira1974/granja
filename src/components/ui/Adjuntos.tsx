import { useRef, useState } from 'react';
import { C } from '@/constants/colors';
import type { Adjunto } from '@/types';

// ─── Upload — múltiples fotos y documentos ────────────────────────────────────

interface AdjuntosUploadProps {
  fotos: Adjunto[];
  setFotos: (f: Adjunto[]) => void;
  documentos: Adjunto[];
  setDocumentos: (d: Adjunto[]) => void;
}

export function AdjuntosUpload({ fotos, setFotos, documentos, setDocumentos }: AdjuntosUploadProps) {
  const fotoRef = useRef<HTMLInputElement>(null);
  const docRef  = useRef<HTMLInputElement>(null);

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev =>
        setFotos([...fotos, { nombre: file.name, preview: ev.target?.result as string }]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDocumentos([...documentos, ...files.map(f => ({ nombre: f.name }))]);
    e.target.value = '';
  };

  const removeFoto = (i: number) => setFotos(fotos.filter((_, idx) => idx !== i));
  const removeDoc  = (i: number) => setDocumentos(documentos.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.gris, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 0 }}>
        Registro fotográfico y documentos
      </label>

      {/* ── Fotos ── */}
      <div>
        {fotos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6, marginBottom: 8 }}>
            {fotos.map((f, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #E4E8EF' }}>
                {f.preview ? (
                  <img src={f.preview} alt={f.nombre} style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 70, background: '#F0FAF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="material-icons" style={{ color: C.verdeLight, fontSize: 28 }}>photo</i>
                  </div>
                )}
                <div style={{ padding: '3px 5px', fontSize: 9, color: '#818EA3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#fff' }}>
                  {f.nombre}
                </div>
                <button
                  onClick={() => removeFoto(i)}
                  style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}
        <div
          onClick={() => fotoRef.current?.click()}
          style={{ border: `2px dashed ${fotos.length > 0 ? C.verdeMid : C.grisL}`, borderRadius: 10, padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: fotos.length > 0 ? '#F0FAF4' : C.crema, transition: 'all 0.15s' }}
        >
          <span style={{ fontSize: 22 }}>📷</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: fotos.length > 0 ? C.verde : C.gris }}>
              {fotos.length > 0 ? `${fotos.length} foto(s) · agregar más` : 'Adjuntar fotografías'}
            </div>
            <div style={{ fontSize: 11, color: C.gris }}>JPG, PNG · puedes seleccionar varias a la vez</div>
          </div>
        </div>
        <input ref={fotoRef} type="file" accept="image/*" multiple onChange={handleFotos} style={{ display: 'none' }} />
      </div>

      {/* ── Documentos ── */}
      <div>
        {documentos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {documentos.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#FFF8F0', border: `1px solid ${C.tierraL}`, borderRadius: 6 }}>
                <i className="material-icons" style={{ fontSize: 14, color: C.tierra }}>description</i>
                <span style={{ fontSize: 12, color: C.tierra, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</span>
                <button onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', color: '#818EA3', cursor: 'pointer', fontSize: 16, padding: 0, marginLeft: 2, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div
          onClick={() => docRef.current?.click()}
          style={{ border: `2px dashed ${documentos.length > 0 ? C.tierra : C.grisL}`, borderRadius: 10, padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: documentos.length > 0 ? '#FFF8F0' : C.crema, transition: 'all 0.15s' }}
        >
          <span style={{ fontSize: 22 }}>{documentos.length > 0 ? '📄' : '📎'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: documentos.length > 0 ? C.tierra : C.gris }}>
              {documentos.length > 0 ? `${documentos.length} documento(s) · agregar más` : 'Adjuntar documentos'}
            </div>
            <div style={{ fontSize: 11, color: C.gris }}>PDF, DOCX, XLSX · puedes seleccionar varios</div>
          </div>
        </div>
        <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" multiple onChange={handleDocs} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// ─── Display — galería mejorada ───────────────────────────────────────────────

interface AdjuntosDisplayProps {
  fotos?: string[];
  documentos?: string[];
}

export function AdjuntosDisplay({ fotos = [], documentos = [] }: AdjuntosDisplayProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (fotos.length === 0 && documentos.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {/* Fotos */}
      {fotos.length > 0 && (
        <div style={{ marginBottom: documentos.length > 0 ? 16 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            <i className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>photo_library</i>
            Fotografías ({fotos.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {fotos.map((nombre, i) => (
              <div
                key={i}
                onClick={() => setLightbox(nombre)}
                style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E4E8EF', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ height: 90, background: 'linear-gradient(135deg, #F0FAF4 0%, #D8F0E8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <i className="material-icons" style={{ fontSize: 36, color: C.verdeLight }}>photo</i>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }} />
                </div>
                <div style={{ padding: '6px 8px', background: '#fff' }}>
                  <div style={{ fontSize: 10, color: '#818EA3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos */}
      {documentos.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            <i className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>attach_file</i>
            Documentos ({documentos.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {documentos.map((nombre, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#FFF8F0', border: `1px solid ${C.tierraL}`, borderRadius: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.tierra + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="material-icons" style={{ fontSize: 18, color: C.tierra }}>
                    {nombre.endsWith('.pdf') ? 'picture_as_pdf' : nombre.match(/\.xlsx?$/i) ? 'table_chart' : 'description'}
                  </i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.tierra, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                  <div style={{ fontSize: 10, color: '#818EA3' }}>{nombre.split('.').pop()?.toUpperCase() ?? 'Archivo'}</div>
                </div>
                <i className="material-icons" style={{ fontSize: 16, color: C.tierraL }}>download</i>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox simple */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 420, width: '90%', textAlign: 'center', position: 'relative' }}>
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#818EA3', cursor: 'pointer', lineHeight: 1 }}
            >×</button>
            <div style={{ height: 200, background: 'linear-gradient(135deg, #F0FAF4 0%, #D8F0E8 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <i className="material-icons" style={{ fontSize: 72, color: C.verdeLight }}>photo</i>
            </div>
            <div style={{ fontSize: 13, color: '#818EA3' }}>{lightbox}</div>
            <div style={{ fontSize: 11, color: '#C8D2E0', marginTop: 4 }}>Vista previa no disponible (imagen de ejemplo)</div>
          </div>
        </div>
      )}
    </div>
  );
}
