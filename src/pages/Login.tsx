import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import uscoLogo from '@/assets/USCO_Logo.png';
import { MOCK_USUARIOS } from '@/constants/mockData';
import { C } from '@/constants/colors';
import { Input, Btn, Badge } from '@/components/ui';

const SLIDES = [
  { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', label: 'Cultivos experimentales' },
  { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=80', label: 'Producción agrícola' },
  { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80', label: 'Granja Experimental USCO' },
  { url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80', label: 'Investigación agropecuaria' },
];

// ── Panel de formulario (compartido entre ambas versiones) ────────────────────
function FormPanel({
  email, setEmail, pass, setPass, error, loading, onSubmit, variant,
}: {
  email: string; setEmail: (v: string) => void;
  pass: string;  setPass:  (v: string) => void;
  error: string; loading: boolean;
  onSubmit: () => void;
  variant: 'a' | 'b';
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: variant === 'a' ? '40px 40px' : '48px 44px',
      height: '100%', overflowY: 'auto',
    }}>
      {/* Logo + título */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: variant === 'b' ? '#F8F4ED' : '#fff',
          border: `3px solid ${variant === 'b' ? '#C8A84B33' : '#F0F2F5'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <img src={uscoLogo} alt="Logo USCO" style={{ width: 54, height: 54, objectFit: 'contain' }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1C1C1C', fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
          GranjaUSCO
        </h1>
        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#818EA3', letterSpacing: '0.02em' }}>
          Sistema de Trazabilidad Agrícola
        </p>
        <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg, #8B1A1A, #C8A84B)', borderRadius: 2, margin: '12px auto 0' }} />
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <Input label="Correo institucional" value={email} onChange={setEmail} placeholder="usuario@usco.edu.co" />
        <div onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onSubmit()}>
          <Input label="Contraseña" value={pass} onChange={setPass} type="password" placeholder="••••••••" />
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.alerta, fontSize: 12, background: '#FFF5F3', padding: '8px 12px', borderRadius: 8, border: '1px solid #FECACA' }}>
            <i className="material-icons" style={{ fontSize: 15 }}>error_outline</i>
            {error}
          </div>
        )}
        <Btn onClick={onSubmit} disabled={loading}>
          {loading ? 'Verificando…' : 'Ingresar al sistema'}
        </Btn>
      </div>

      {/* Usuarios demo */}
      <div style={{ padding: '12px 14px', background: '#F8F9FA', borderRadius: 10, border: '1px solid #EAEDF0', fontSize: 11, color: C.gris }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <i className="material-icons" style={{ fontSize: 14, color: '#C8A84B' }}>vpn_key</i>
          <strong style={{ color: C.oscuro, fontSize: 11 }}>Demo — contraseña: 1234</strong>
        </div>
        {MOCK_USUARIOS.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <span
              style={{ cursor: 'pointer', color: C.verde, fontWeight: 600, fontSize: 11 }}
              onClick={() => setEmail(u.email)}
            >
              {u.email}
            </span>
            <Badge label={u.rol} />
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 10, color: '#C8D2E0', textAlign: 'center', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} Universidad Surcolombiana · Neiva, Huila
      </p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [slide,   setSlide]   = useState(0);
  const [version, setVersion] = useState<'a' | 'b'>('a');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async () => {
    if (!email || !pass) { setError('Completa todos los campos.'); return; }
    setLoading(true);
    const ok = await login(email, pass);
    setLoading(false);
    if (!ok) setError('Credenciales incorrectas. Contraseña demo: 1234');
    else setError('');
  };

  const formProps = { email, setEmail, pass, setPass, error, loading, onSubmit: handleSubmit };

  // ── Toggle de versión ──────────────────────────────────────────────────────
  const Toggle = () => (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
      borderRadius: 30, padding: '5px 6px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
      border: '1px solid rgba(0,0,0,0.06)',
      zIndex: 100,
    }}>
      <span style={{ fontSize: 11, color: '#818EA3', marginLeft: 8, marginRight: 4, whiteSpace: 'nowrap' }}>Vista:</span>
      {(['a', 'b'] as const).map(v => (
        <button
          key={v}
          onClick={() => setVersion(v)}
          style={{
            padding: '5px 14px', borderRadius: 22, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
            background: version === v ? '#8B1A1A' : 'transparent',
            color: version === v ? '#fff' : '#818EA3',
            transition: 'all 0.2s',
          }}
        >
          {v === 'a' ? '🖼  Con imágenes' : '🎨  Colores USCO'}
        </button>
      ))}
    </div>
  );

  // ── Versión A: carrusel + form ─────────────────────────────────────────────
  if (version === 'a') {
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Carrusel 68% */}
        <div style={{ flex: '0 0 68%', position: 'relative', overflow: 'hidden' }}>
          {SLIDES.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${s.url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: slide === i ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
            />
          ))}
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(139,26,26,0.35) 0%, rgba(0,0,0,0.55) 100%)' }} />

          {/* Branding superior */}
          <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={uscoLogo} alt="USCO" style={{ width: 38, height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>Universidad Surcolombiana</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>Facultad de Ingeniería Agronómica</div>
            </div>
          </div>

        </div>

        {/* Form 32% — rojo USCO directo */}
        <div style={{
          flex: '0 0 32%',
          background: 'linear-gradient(145deg, #6B0F0F 0%, #8B1A1A 50%, #5A0A0A 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 36px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Círculos decorativos */}
          <div style={{ position: 'absolute', top: -70, right: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(200,168,75,0.09)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -90, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(200,168,75,0.35)' }}>
                <img src={uscoLogo} alt="USCO" style={{ width: 38, height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, fontFamily: 'Georgia, serif' }}>GranjaUSCO</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 3 }}>Sistema de Trazabilidad Agrícola</div>
              <div style={{ width: 28, height: 3, background: 'linear-gradient(90deg, #C8A84B, rgba(200,168,75,0.3))', borderRadius: 2, margin: '8px auto 0' }} />
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Correo institucional</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@usco.edu.co"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#C8A84B')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Contraseña</div>
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#C8A84B')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
              {error && (
                <div style={{ fontSize: 11, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="material-icons" style={{ fontSize: 14 }}>error_outline</i>{error}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '70%', padding: '10px', borderRadius: 8, border: 'none', background: '#fff', color: '#8B1A1A', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                {loading ? 'Verificando…' : 'Ingresar al sistema'}
              </button>
              </div>
            </div>

            {/* Demo */}
            <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <i className="material-icons" style={{ fontSize: 13, color: '#C8A84B' }}>vpn_key</i>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Demo — contraseña: 1234</span>
              </div>
              {MOCK_USUARIOS.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span
                    onClick={() => setEmail(u.email)}
                    style={{ cursor: 'pointer', color: '#C8A84B', fontSize: 10, fontWeight: 600 }}
                  >
                    {u.email}
                  </span>
                  <Badge label={u.rol} />
                </div>
              ))}
            </div>

            <p style={{ marginTop: 14, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              © {new Date().getFullYear()} Universidad Surcolombiana
            </p>
          </div>
        </div>

        <Toggle />
      </div>
    );
  }

  // ── Versión B: fondo USCO completo + modal centrado ──────────────────────
  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(145deg, #6B0F0F 0%, #8B1A1A 45%, #7A1515 70%, #5A0A0A 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Círculos decorativos */}
      <div style={{ position: 'fixed', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'rgba(200,168,75,0.09)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -140, left: -100, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '35%', left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(200,168,75,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

      {/* Header superior */}
      <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(255,255,255,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(4px)' }}>
          <img src={uscoLogo} alt="USCO" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Universidad Surcolombiana</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>Facultad de Ingeniería Agronómica · Neiva, Huila</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8A84B' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(200,168,75,0.45)' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(200,168,75,0.2)' }} />
        </div>
      </div>

      {/* Modal central */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 24px 16px', position: 'relative', zIndex: 1, minHeight: 0 }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: '#F0EEEE',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,168,75,0.15)',
          overflow: 'hidden',
          maxHeight: '100%',
          overflowY: 'auto',
        }}>
          {/* Franja dorada superior del modal */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #8B1A1A, #C8A84B, #8B1A1A)', flexShrink: 0 }} />

          <div style={{ padding: '24px 36px 22px' }}>
            {/* Logo + título */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#F8F4ED',
                border: '3px solid rgba(200,168,75,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 16px rgba(139,26,26,0.12)',
              }}>
                <img src={uscoLogo} alt="Logo USCO" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              </div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1C1C1C', fontFamily: 'Georgia, serif' }}>
                GranjaUSCO
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#818EA3' }}>Sistema de Trazabilidad Agrícola</p>
              <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg, #8B1A1A, #C8A84B)', borderRadius: 2, margin: '9px auto 0' }} />
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Correo institucional</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@usco.edu.co"
                  style={{ width: '100%', background: 'rgba(139,26,26,0.07)', border: '1.5px solid rgba(139,26,26,0.2)', borderRadius: 8, padding: '9px 12px', color: '#3D3D3D', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#8B1A1A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(139,26,26,0.2)')}
                />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Contraseña</div>
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', background: 'rgba(139,26,26,0.07)', border: '1.5px solid rgba(139,26,26,0.2)', borderRadius: 8, padding: '9px 12px', color: '#3D3D3D', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#8B1A1A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(139,26,26,0.2)')}
                />
              </div>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8B1A1A', fontSize: 12, background: 'rgba(139,26,26,0.07)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(139,26,26,0.2)' }}>
                  <i className="material-icons" style={{ fontSize: 15 }}>error_outline</i>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '70%', padding: '10px', borderRadius: 8, border: 'none', background: '#8B1A1A', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s', boxShadow: '0 4px 14px rgba(139,26,26,0.35)' }}
                >
                  {loading ? 'Verificando…' : 'Ingresar al sistema'}
                </button>
              </div>
            </div>

            {/* Demo */}
            <div style={{ padding: '11px 13px', background: '#F8F9FA', borderRadius: 10, border: '1px solid #EAEDF0', fontSize: 11, color: C.gris }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <i className="material-icons" style={{ fontSize: 14, color: '#C8A84B' }}>vpn_key</i>
                <strong style={{ color: C.oscuro }}>Demo — contraseña: 1234</strong>
              </div>
              {MOCK_USUARIOS.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ cursor: 'pointer', color: C.verde, fontWeight: 600 }} onClick={() => setEmail(u.email)}>
                    {u.email}
                  </span>
                  <Badge label={u.rol} />
                </div>
              ))}
            </div>

            <p style={{ marginTop: 12, fontSize: 10, color: '#C8D2E0', textAlign: 'center' }}>
              © {new Date().getFullYear()} Universidad Surcolombiana · Neiva, Huila
            </p>
          </div>
        </div>
      </div>

      <Toggle />
    </div>
  );
}
