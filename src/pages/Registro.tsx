import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import uscoLogo from '@/assets/USCO_Logo.png';

const ROLES_OPCIONES = [
  { value: 'estudiante' as const, label: 'Estudiante',          desc: 'Pertenezco a la Universidad Surcolombiana', icon: 'school'  },
  { value: 'particular' as const, label: 'Visitante / Particular', desc: 'Soy externo a la institución',          icon: 'person'  },
];

// ── Cabecera ──────────────────────────────────────────────────────────────────
function FormHeader({ dark }: { dark: boolean }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <div style={{ width: 58, height: 58, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.12)' : '#F8F4ED', border: `2px solid ${dark ? 'rgba(200,168,75,0.35)' : 'rgba(200,168,75,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(139,26,26,0.12)' }}>
        <img src={uscoLogo} alt="USCO" style={{ width: 38, height: 38, objectFit: 'contain', filter: dark ? 'brightness(0) invert(1)' : 'none' }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: dark ? '#fff' : '#1C1C1C', fontFamily: 'Georgia, serif' }}>Crear cuenta</div>
      <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : '#818EA3', marginTop: 3 }}>Granja Experimental USCO</div>
      <div style={{ width: 28, height: 3, background: 'linear-gradient(90deg, #C8A84B, rgba(200,168,75,0.3))', borderRadius: 2, margin: '8px auto 0' }} />
    </div>
  );
}

// ── Formulario ────────────────────────────────────────────────────────────────
interface FormProps {
  dark: boolean;
  nombre: string; setNombre: (v: string) => void;
  email: string;  setEmail:  (v: string) => void;
  pass: string;   setPass:   (v: string) => void;
  pass2: string;  setPass2:  (v: string) => void;
  rol: 'estudiante' | 'particular'; setRol: (v: 'estudiante' | 'particular') => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  onGoLogin: () => void;
}

function Form({ dark, nombre, setNombre, email, setEmail, pass, setPass, pass2, setPass2, rol, setRol, error, loading, onSubmit, onGoLogin }: FormProps) {
  const accentColor = dark ? '#C8A84B' : '#8B1A1A';
  const borderInactive = dark ? 'rgba(255,255,255,0.15)' : 'rgba(139,26,26,0.2)';
  const labelColor = dark ? 'rgba(255,255,255,0.6)' : '#8B1A1A';

  const fields: { label: string; value: string; set: (v: string) => void; type: string; placeholder: string }[] = [
    { label: 'Nombre completo',      value: nombre, set: setNombre, type: 'text',     placeholder: 'Ej. Ana Torres' },
    { label: 'Correo electrónico',   value: email,  set: setEmail,  type: 'email',    placeholder: 'correo@ejemplo.com' },
    { label: 'Contraseña',           value: pass,   set: setPass,   type: 'password', placeholder: '••••••••' },
    { label: 'Confirmar contraseña', value: pass2,  set: setPass2,  type: 'password', placeholder: '••••••••' },
  ];

  return (
    <>
      {/* Selector de rol */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Tipo de usuario
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ROLES_OPCIONES.map(op => {
            const active = rol === op.value;
            return (
              <button
                key={op.value}
                type="button"
                onClick={() => setRol(op.value)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${active ? accentColor : borderInactive}`,
                  background: active ? (dark ? 'rgba(200,168,75,0.15)' : 'rgba(139,26,26,0.06)') : (dark ? 'rgba(255,255,255,0.06)' : 'transparent'),
                  transition: 'all 0.15s',
                }}
              >
                <i className="material-icons" style={{ fontSize: 20, color: active ? accentColor : (dark ? 'rgba(255,255,255,0.4)' : '#aaa'), display: 'block', marginBottom: 4 }}>{op.icon}</i>
                <div style={{ fontSize: 11, fontWeight: 700, color: active ? accentColor : (dark ? 'rgba(255,255,255,0.6)' : '#666') }}>{op.label}</div>
                <div style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.35)' : '#aaa', marginTop: 2, lineHeight: 1.3 }}>{op.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos de texto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }}>
        {fields.map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              {f.label}
            </div>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              onKeyDown={e => e.key === 'Enter' && onSubmit()}
              style={{ width: '100%', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(139,26,26,0.07)', border: `1.5px solid ${borderInactive}`, color: dark ? '#fff' : '#3D3D3D' }}
              onFocus={e => (e.target.style.borderColor = accentColor)}
              onBlur={e => (e.target.style.borderColor = borderInactive)}
            />
          </div>
        ))}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '8px 12px', borderRadius: 8, background: dark ? 'rgba(220,38,38,0.15)' : 'rgba(139,26,26,0.07)', border: `1px solid ${dark ? 'rgba(220,38,38,0.4)' : 'rgba(139,26,26,0.2)'}`, color: dark ? '#FCA5A5' : '#8B1A1A' }}>
            <i className="material-icons" style={{ fontSize: 15 }}>error_outline</i>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <button
            onClick={onSubmit}
            disabled={loading}
            style={{ width: '80%', padding: '11px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s', background: dark ? '#fff' : '#8B1A1A', color: dark ? '#8B1A1A' : '#fff', boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 4px 14px rgba(139,26,26,0.3)' }}
          >
            {loading ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: dark ? 'rgba(255,255,255,0.45)' : '#818EA3', marginBottom: 0 }}>
        ¿Ya tienes cuenta?{' '}
        <span onClick={onGoLogin} style={{ color: accentColor, fontWeight: 700, cursor: 'pointer' }}>
          Inicia sesión
        </span>
      </p>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function RegistroPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [pass2,    setPass2]    = useState('');
  const [rol,      setRol]      = useState<'estudiante' | 'particular'>('estudiante');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!nombre.trim() || !email.trim() || !pass || !pass2) { setError('Completa todos los campos.'); return; }
    if (pass !== pass2) { setError('Las contraseñas no coinciden.'); return; }
    if (pass.length < 4) { setError('La contraseña debe tener al menos 4 caracteres.'); return; }
    setLoading(true);
    const result = await register(nombre.trim(), email.trim().toLowerCase(), pass, rol);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? 'Error al registrar.'); return; }
    navigate(ROUTES.GRANJA, { replace: true });
  };

  const formProps: FormProps = {
    dark: false, nombre, setNombre, email, setEmail, pass, setPass, pass2, setPass2,
    rol, setRol, error, loading, onSubmit: handleSubmit, onGoLogin: () => navigate(ROUTES.LOGIN),
  };

  // ── VERSIÓN MÓVIL ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #6B0F0F 0%, #8B1A1A 45%, #5A0A0A 100%)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'auto' }}>
        <div style={{ position: 'fixed', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,168,75,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: -100, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ padding: '16px 20px', position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(ROUTES.LOGIN)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 12 }}>
            <i className="material-icons" style={{ fontSize: 18 }}>arrow_back</i>
            Volver
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', maxWidth: 420, background: '#F0EEEE', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #8B1A1A, #C8A84B, #8B1A1A)' }} />
            <div style={{ padding: '22px 28px 24px' }}>
              <FormHeader dark={false} />
              <Form {...formProps} dark={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VERSIÓN ESCRITORIO ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Panel izquierdo informativo */}
      <div style={{ flex: '0 0 55%', background: 'linear-gradient(145deg, #6B0F0F 0%, #8B1A1A 50%, #5A0A0A 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(200,168,75,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <img src={uscoLogo} alt="USCO" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Universidad Surcolombiana</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Facultad de Ingeniería Agronómica</div>
            </div>
          </div>

          <h1 style={{ color: '#C8A84B', fontSize: 32, fontWeight: 900, fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: 1.2 }}>
            Bienvenido a la<br />Granja Experimental
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, marginBottom: 36, maxWidth: 380 }}>
            Crea tu cuenta para acceder al sistema de trazabilidad agrícola de la USCO y seguir el trabajo que realizamos en la granja.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'map',         text: 'Explora las zonas y cultivos activos de la granja' },
              { icon: 'inventory_2', text: 'Consulta el inventario de insumos y maquinaria' },
              { icon: 'agriculture', text: 'Seguimiento del tractor y registros de campo' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="material-icons" style={{ color: '#C8A84B', fontSize: 18 }}>{item.icon}</i>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div style={{ flex: '0 0 45%', background: 'linear-gradient(145deg, #6B0F0F 0%, #8B1A1A 50%, #5A0A0A 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 44px', position: 'relative', overflow: 'hidden auto' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(200,168,75,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(ROUTES.LOGIN)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 12, marginBottom: 20 }}>
            <i className="material-icons" style={{ fontSize: 16 }}>arrow_back</i>
            Volver al inicio de sesión
          </button>

          <FormHeader dark={true} />
          <Form {...formProps} dark={true} />

          <p style={{ marginTop: 20, fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            © {new Date().getFullYear()} Universidad Surcolombiana · Neiva, Huila
          </p>
        </div>
      </div>
    </div>
  );
}
