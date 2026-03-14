import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import uscoLogo from '@/assets/USCO_Logo.png';

export default function AccesoRestringido() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F8F9FA 0%, #F0EEF0 100%)',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: 440, width: '100%', textAlign: 'center',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {/* Franja superior */}
        <div style={{ height: 5, background: 'linear-gradient(90deg, #8B1A1A, #C8A84B, #8B1A1A)' }} />

        <div style={{ padding: '40px 44px 36px' }}>
          {/* Icono */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF2F2, #FDF3DC)',
            border: '2px solid rgba(139,26,26,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <i className="material-icons" style={{ fontSize: 34, color: '#8B1A1A' }}>lock</i>
          </div>

          {/* Título */}
          <h2 style={{
            margin: '0 0 10px', fontSize: 22, fontWeight: 900,
            color: '#1C1C1C', fontFamily: 'Georgia, serif',
          }}>
            Acceso restringido
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#818EA3', lineHeight: 1.7 }}>
            Para acceder a esta sección necesitas iniciar sesión con tus credenciales institucionales.
          </p>

          {/* Logo + nombre sistema */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px', background: '#F8F4ED', borderRadius: 12,
            marginBottom: 28, border: '1px solid rgba(200,168,75,0.2)',
          }}>
            <img src={uscoLogo} alt="USCO" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C' }}>GranjaUSCO</div>
              <div style={{ fontSize: 10, color: '#818EA3' }}>Sistema de Trazabilidad Agrícola</div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: '#8B1A1A', color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(139,26,26,0.3)',
              }}
            >
              <i className="material-icons" style={{ fontSize: 18 }}>login</i>
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate(ROUTES.GRANJA)}
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                border: '1.5px solid #E4E8EF', background: 'transparent',
                color: '#818EA3', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <i className="material-icons" style={{ fontSize: 16 }}>arrow_back</i>
              Volver a la granja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
