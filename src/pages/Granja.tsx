import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { C } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import granjaRaw from '@/data/granja.json';
import uscoLogo from '@/assets/USCO_Logo.png';
import { useAuth } from '@/context/AuthContext';
import { zonasService } from '@/services/zonas.service';
import type { ZonaInfo } from '@/services/zonas.service';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type AreaTipo = 'lote' | 'estanque' | 'invernadero' | 'isla';
type AreaInfo = ZonaInfo;

const TIPO_ICON: Record<AreaTipo, string> = {
  lote: 'grass', estanque: 'water', invernadero: 'eco', isla: 'park',
};

// ── GeoJSON tipado ────────────────────────────────────────────────────────────
type RawFeature = {
  type: 'Feature';
  properties: { nombre: string; descripcion: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
};
const granjaFeatures = (granjaRaw as { type: string; features: RawFeature[] }).features;

// ── AREAS: geometría del GeoJSON + datos del servicio ─────────────────────────
const AREAS: AreaInfo[] = granjaFeatures.map(f => {
  const id  = f.properties.nombre;
  const svc = zonasService.getById(id);
  return svc ?? {
    id, nombre: id, tipo: 'lote' as AreaTipo,
    color: '#888888', lineColor: '#ffffff', imagenes: [],
  };
});

// ── Convertir coordenadas GeoJSON [lng,lat] → LatLng de Google Maps ───────────
function toLatLng(coords: number[][]): google.maps.LatLngLiteral[] {
  return coords.map(([lng, lat]) => ({ lat, lng }));
}

// ── Centroide para hacer pan al seleccionar ───────────────────────────────────
function centroid(coords: number[][]): google.maps.LatLngLiteral {
  const lat = coords.reduce((s, p) => s + p[1], 0) / coords.length;
  const lng = coords.reduce((s, p) => s + p[0], 0) / coords.length;
  return { lat, lng };
}

// ── Estadísticas y contenido estático ────────────────────────────────────────
const FARM_CENTER = { lat: 2.8905, lng: -75.3075 };

const CURIOSIDADES = [
  { icon: 'thermostat',  text: 'Temperatura promedio de 28°C. Los pisos térmicos oscilan entre 25°C y 32°C a lo largo del año.' },
  { icon: 'opacity',     text: 'Precipitación bimodal de 1.600 mm/año, con épocas secas en enero–febrero y julio–agosto.' },
  { icon: 'biotech',     text: 'Escenario de más de 120 trabajos de grado y 15 proyectos de investigación desde 1984.' },
  { icon: 'diversity_3', text: 'Más de 500 estudiantes realizan prácticas anuales en las instalaciones.' },
  { icon: 'park',        text: 'Alberga islas de bosque nativo como zonas de conservación del Alto Magdalena.' },
  { icon: 'wb_sunny',    text: 'Sistema de riego fotovoltaico en prueba piloto para los lotes E4 y E5 desde 2023.' },
];

// ── Genera SVG circular con icono SVG puro como data URL para Google Maps ────
function makeMarkerIcon(color: string, tipo: AreaTipo, size: number): string {
  const r = size / 2;
  const p = (v: number) => (v * size).toFixed(1);

  // Formas SVG puras (sin fuentes) para cada tipo
  let icon = '';
  if (tipo === 'lote') {
    // Tres tallos de pasto
    icon = `
      <rect x="${p(0.30)}" y="${p(0.40)}" width="${p(0.09)}" height="${p(0.30)}" rx="${p(0.04)}" fill="white"/>
      <rect x="${p(0.455)}" y="${p(0.26)}" width="${p(0.09)}" height="${p(0.44)}" rx="${p(0.04)}" fill="white"/>
      <rect x="${p(0.61)}" y="${p(0.40)}" width="${p(0.09)}" height="${p(0.30)}" rx="${p(0.04)}" fill="white"/>`;
  } else if (tipo === 'estanque') {
    // Gota de agua
    icon = `<path d="M${p(0.5)},${p(0.20)} C${p(0.5)},${p(0.20)} ${p(0.72)},${p(0.50)} ${p(0.72)},${p(0.60)} A${p(0.22)},${p(0.22)},0,0,1,${p(0.28)},${p(0.60)} C${p(0.28)},${p(0.50)} ${p(0.5)},${p(0.20)} ${p(0.5)},${p(0.20)} Z" fill="white"/>`;
  } else if (tipo === 'invernadero') {
    // Casa (invernadero)
    icon = `
      <polygon points="${p(0.5)},${p(0.20)} ${p(0.78)},${p(0.50)} ${p(0.22)},${p(0.50)}" fill="white"/>
      <rect x="${p(0.35)}" y="${p(0.50)}" width="${p(0.30)}" height="${p(0.27)}" fill="white"/>`;
  } else {
    // Árbol (isla)
    icon = `
      <polygon points="${p(0.5)},${p(0.18)} ${p(0.76)},${p(0.56)} ${p(0.24)},${p(0.56)}" fill="white"/>
      <rect x="${p(0.43)}" y="${p(0.55)}" width="${p(0.14)}" height="${p(0.22)}" fill="white"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="${color}" stroke="white" stroke-width="2.5"/>
    ${icon}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GranjaPage() {
  useAuth();
  const navigate  = useNavigate();
  const [selected,       setSelected]       = useState<AreaInfo | null>(null);
  const [zona,           setZona]           = useState<string | null>(null);
  const [geoErr,         setGeoErr]         = useState('');
  const [geoLoading,     setGeoLoading]     = useState(false);
  const [map,            setMap]            = useState<google.maps.Map | null>(null);
  const [userPos,        setUserPos]        = useState<google.maps.LatLngLiteral | null>(null);
  const [fsElement,      setFsElement]      = useState<Element | null>(null);
  const [showZonaSheet,  setShowZonaSheet]  = useState(false); // bottom sheet mobile
  const [showListSheet,  setShowListSheet]  = useState(false); // lista de zonas mobile
  const [isMobile,       setIsMobile]       = useState(() => window.innerWidth < 768);
  const zonas = zonasService.getAll();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Detecta el elemento real que entra en pantalla completa (el canvas interno de Google Maps)
  useEffect(() => {
    const handler = () => {
      const el = document.fullscreenElement ?? (document as any).webkitFullscreenElement ?? null;
      setFsElement(el);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  // Refs para instancias imperativas de Google Maps
  const polygonRefs = useRef<google.maps.Polygon[]>([]);
  const markerRefs  = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const selectedRef = useRef<AreaInfo | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY as string,
  });

  // ── Crear polígonos e iconos imperativamente cuando el mapa cargue ──────────
  useEffect(() => {
    if (!map) return;

    // Limpiar instancias previas
    polygonRefs.current.forEach(p => p.setMap(null));
    markerRefs.current.forEach(m => m.setMap(null));
    polygonRefs.current = [];
    markerRefs.current  = [];

    granjaFeatures.forEach(f => {
      const id   = f.properties.nombre;
      const area = AREAS.find(a => a.id === id);
      if (!area) return;

      const paths = toLatLng(f.geometry.coordinates[0]);

      // Polígono
      const poly = new google.maps.Polygon({
        map,
        paths,
        fillColor:     area.color,
        fillOpacity:   0.2,
        strokeColor:   '#4ADE80',
        strokeOpacity: 1,
        strokeWeight:  2,
        clickable:     true,
        zIndex:        1,
      });
      poly.addListener('click', () => handleSelectArea(area));
      polygonRefs.current.push(poly);

      // Marcador circular
      const c    = centroid(f.geometry.coordinates[0]);
      const size = 28;
      const marker = new google.maps.Marker({
        map,
        position:  c,
        title:     area.nombre,
        icon: {
          url:        makeMarkerIcon(area.color, area.tipo, size),
          scaledSize: new google.maps.Size(size, size),
          anchor:     new google.maps.Point(size / 2, size / 2),
        },
        zIndex: 5,
      });
      marker.addListener('click', () => handleSelectArea(area));
      markerRefs.current.push(marker);
    });

    return () => {
      polygonRefs.current.forEach(p => p.setMap(null));
      markerRefs.current.forEach(m => m.setMap(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // ── Actualizar estilos cuando cambia la selección ───────────────────────────
  useEffect(() => {
    selectedRef.current = selected;
    granjaFeatures.forEach((f, idx) => {
      const id         = f.properties.nombre;
      const isSelected = selected?.id === id;
      const area       = AREAS.find(a => a.id === id);
      if (!area) return;

      const poly   = polygonRefs.current[idx];
      const marker = markerRefs.current[idx];
      if (!poly || !marker) return;

      poly.setOptions({
        fillOpacity:  isSelected ? 0.45 : 0.2,
        strokeColor:  isSelected ? '#ffffff' : '#4ADE80',
        strokeWeight: isSelected ? 4 : 2,
        zIndex:       isSelected ? 10 : 1,
      });

      const size = isSelected ? 36 : 28;
      marker.setIcon({
        url:        makeMarkerIcon(area.color, area.tipo, size),
        scaledSize: new google.maps.Size(size, size),
        anchor:     new google.maps.Point(size / 2, size / 2),
      });
      marker.setZIndex(isSelected ? 20 : 5);
    });
  }, [selected]);

  // ── Marcador de posición del usuario ────────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    if (!userPos) return;
    userMarkerRef.current = new google.maps.Marker({
      map,
      position: userPos,
      icon: {
        path:          google.maps.SymbolPath.CIRCLE,
        scale:         10,
        fillColor:     '#FF3333',
        fillOpacity:   1,
        strokeColor:   '#ffffff',
        strokeWeight:  3,
      },
      zIndex: 50,
    });
  }, [map, userPos]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const handleSelectArea = useCallback((area: AreaInfo) => {
    setSelected(area);
    setShowListSheet(false);
    if (window.innerWidth < 768) setShowZonaSheet(true);
    const feature = granjaFeatures.find(f => f.properties.nombre === area.id);
    if (!feature || !mapRef.current) return;
    const c = centroid(feature.geometry.coordinates[0]);
    mapRef.current.panTo(c);
    mapRef.current.setZoom(18);
  }, []);

  const onLoad = useCallback((m: google.maps.Map) => {
    mapRef.current = m;
    setMap(m);
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  const flyToArea = useCallback((area: AreaInfo) => {
    handleSelectArea(area);
  }, [handleSelectArea]);

  const resetView = () => {
    setSelected(null);
    mapRef.current?.panTo(FARM_CENTER);
    mapRef.current?.setZoom(16);
  };

  const localizarme = () => {
    if (!navigator.geolocation) { setGeoErr('Geolocalización no disponible.'); return; }
    setGeoLoading(true); setGeoErr('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setUserPos(pos);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(18);
        const found = granjaFeatures.find(f => {
          const path = toLatLng(f.geometry.coordinates[0]);
          const poly = new google.maps.Polygon({ paths: path });
          return google.maps.geometry?.poly?.containsLocation(new google.maps.LatLng(pos.lat, pos.lng), poly);
        });
        setZona(found
          ? `Estás en: ${zonasService.getById(found.properties.nombre)?.nombre ?? found.properties.nombre}`
          : 'Fuera de los límites de la granja'
        );
        setGeoLoading(false);
      },
      () => { setGeoErr('No se pudo obtener tu ubicación.'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
    <div>
      <div className="main-content-container container-fluid py-4">

        {/* ══════════════════════════════════════════════
            HERO PORTADA
        ══════════════════════════════════════════════ */}
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 36, minHeight: 420 }}>
          {/* Imagen de fondo */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85)',
            backgroundSize: 'cover', backgroundPosition: 'center 40%',
          }} />
          {/* Overlay degradado */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, rgba(75,10,10,0.92) 0%, rgba(45,106,79,0.72) 60%, rgba(0,0,0,0.45) 100%)',
          }} />

          {/* Contenido del hero */}
          <div style={{ position: 'relative', zIndex: 1, padding: '52px 48px 48px', display: 'flex', flexDirection: 'column', minHeight: 420 }}>
            {/* Institución */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
              <img src={uscoLogo} alt="USCO" style={{ width: 42, height: 42, objectFit: 'contain', filter: 'brightness(0) invert(1)', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Universidad Surcolombiana</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Facultad de Ingeniería Agronómica · Neiva, Huila</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.4)', borderRadius: 20, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8A84B' }} />
                <span style={{ fontSize: 11, color: '#C8A84B', fontWeight: 600 }}>Operativa desde 1984</span>
              </div>
            </div>

            {/* Título principal */}
            <div style={{ marginTop: 36 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Conoce nuestras instalaciones</p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 50px)', fontWeight: 900, fontFamily: 'Georgia, serif', lineHeight: 1.1, margin: 0, marginBottom: 12 }}>
                Granja Experimental<br />
                <span style={{ color: '#C8A84B' }}>USCO</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, maxWidth: 540, marginBottom: 36 }}>
                Centro de investigación, docencia y extensión agropecuaria. Laboratorio a cielo abierto para más de 500 estudiantes al año.
              </p>

              {/* Stats en el hero */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {[
                  { value: '40+', label: 'Años de\noperación', border: true },
                  { value: '15 ha', label: 'Área\ntotal', border: true },
                  { value: '15', label: 'Lotes\nproductivos', border: true },
                  { value: '8',  label: 'Proyectos\nactivos', border: false },
                ].map(s => (
                  <div key={s.label} style={{
                    paddingRight: s.border ? 28 : 0,
                    marginRight: s.border ? 28 : 0,
                    borderRight: s.border ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}>
                    <div style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, color: '#C8A84B', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ACERCA DE + MISIÓN / VISIÓN
        ══════════════════════════════════════════════ */}
        <div className="row mb-4" style={{ alignItems: 'stretch' }}>
          {/* Texto descriptivo */}
          <div className="col-12 col-lg-5 mb-4 mb-lg-0">
            <div style={{ height: '100%', padding: '2rem 2rem', background: '#fff', border: '1px solid #E4E8EF', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--usco-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="material-icons" style={{ color: '#fff', fontSize: 18 }}>eco</i>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--usco-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quiénes somos</span>
              </div>
              <p style={{ fontSize: 14, color: '#3D5170', lineHeight: 1.9, marginBottom: 16, fontWeight: 400 }}>
                La <strong>Granja Experimental USCO</strong> es un centro de investigación, docencia y extensión agropecuaria ubicado en Neiva, Huila. Con más de 40 años de trayectoria, es el laboratorio a cielo abierto de los programas de Ingeniería Agronómica, Zootecnia y Biología.
              </p>
              <p style={{ fontSize: 13, color: '#818EA3', lineHeight: 1.85, marginBottom: 0 }}>
                Cuenta con <strong style={{ color: '#3D5170' }}>15 lotes y parcelas productivas</strong>, 4 reservorios piscícolas, un vivero, laboratorios de suelos y agua, y una flota de maquinaria agrícola activa.
              </p>
              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                {['Investigación', 'Docencia', 'Extensión', 'Producción'].map(tag => (
                  <span key={tag} style={{ padding: '4px 14px', borderRadius: 20, background: '#F8F9FA', border: '1px solid #E4E8EF', fontSize: 11, color: '#5A6169', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Misión + Visión */}
          <div className="col-12 col-lg-7">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
              {/* Misión */}
              <div style={{
                flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative',
                background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                padding: '1.5rem 1.8rem',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <i className="material-icons" style={{ color: '#52B788', fontSize: 18 }}>flag</i>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Misión</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, marginBottom: 0 }}>
                    Apoyar la formación integral mediante prácticas agropecuarias sostenibles, fomentando la investigación científica y la transferencia de tecnología a las comunidades rurales del Huila.
                  </p>
                </div>
              </div>
              {/* Visión */}
              <div style={{
                flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative',
                background: 'linear-gradient(135deg, #5C3A00 0%, #92620A 100%)',
                padding: '1.5rem 1.8rem',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <i className="material-icons" style={{ color: '#C8A84B', fontSize: 18 }}>visibility</i>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#C8A84B', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Visión</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, marginBottom: 0 }}>
                    Ser referente regional en investigación agropecuaria sostenible, articulando ciencia, tecnología y saberes ancestrales para contribuir a la seguridad alimentaria del sur colombiano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            GALERÍA CON FOTOS REALES
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Instalaciones</p>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: '#3D5170', margin: 0 }}>Un vistazo a la granja</h4>
            </div>
            <span style={{ fontSize: 11, color: '#C8D2E0', fontStyle: 'italic' }}>Galería multimedia · próximamente fotos reales</span>
          </div>

          {/* Grid de fotos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 12 }}>
            {/* Foto grande — ocupa 2 filas en desktop */}
            {[
              {
                url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
                label: 'Cultivos en producción', sub: 'Lotes productivos E1–E5',
                grid: 'col-span-1 row-span-2', style: { gridRow: 'span 2', height: '100%', minHeight: 280 },
              },
              {
                url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
                label: 'Paisaje agrícola', sub: 'Vista general de la granja',
                grid: '', style: { height: 160 },
              },
              {
                url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
                label: 'Investigación aplicada', sub: 'Proyectos activos',
                grid: '', style: { height: 160 },
              },
              {
                url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
                label: 'Invernadero y vivero', sub: 'Producción de material vegetal',
                grid: '', style: { height: 160 },
              },
              {
                url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
                label: 'Parcelas experimentales', sub: 'Ensayos varietales',
                grid: '', style: { height: 160 },
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{ ...item.style, borderRadius: 12, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={e => {
                  const img = (e.currentTarget as HTMLElement).querySelector('.gallery-img') as HTMLElement;
                  if (img) img.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  const img = (e.currentTarget as HTMLElement).querySelector('.gallery-img') as HTMLElement;
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div
                  className="gallery-img"
                  style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${item.url})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    transition: 'transform 0.4s ease',
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
                  <div style={{ fontSize: i === 0 ? 15 : 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mapa Google Maps ── */}
        <div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Encabezado */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F0F2F5' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Mapa satelital interactivo — coordenadas GPS reales
                </div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                  Clic en un lote para ver detalles · Scroll para zoom
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                {zona && (
                  <div style={{ fontSize: 12, background: C.verde + '22', color: C.verde, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                    <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>location_on</i>
                    {zona}
                  </div>
                )}
                <button className="btn btn-sm" style={{ background: '#3D5170', color: '#fff', borderRadius: 20, border: 'none' }} onClick={resetView}>
                  <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>fit_screen</i>
                  Vista general
                </button>
                <button className="btn btn-sm" style={{ background: '#8B1A1A', color: '#fff', borderRadius: 20, border: 'none' }} onClick={localizarme} disabled={geoLoading}>
                  <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>
                    {geoLoading ? 'hourglass_empty' : 'my_location'}
                  </i>
                  {geoLoading ? 'Localizando...' : '¿Dónde estoy?'}
                </button>
                {!isMobile && (
                  <button className="btn btn-sm" style={{ background: C.verde, color: '#fff', borderRadius: 20, border: 'none' }} onClick={() => navigate(ROUTES.ZONAS)}>
                    <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>layers</i>
                    Ver zonas
                  </button>
                )}
              </div>
            </div>
            {geoErr && (
              <div style={{ fontSize: 12, color: '#8B1A1A', marginTop: 6 }}>
                <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>error_outline</i>
                {geoErr}
              </div>
            )}
          </div>

          {/* Mapa + sidebar */}
          <div style={{ display: 'flex', height: 580 }}>

            {/* Google Map */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!isLoaded ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818EA3', fontSize: 13 }}>
                  <i className="material-icons" style={{ marginRight: 8, fontSize: 18 }}>hourglass_empty</i>
                  Cargando mapa...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={FARM_CENTER}
                  zoom={16}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    mapTypeId: 'satellite',
                    disableDefaultUI: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    tilt: 0,
                  }}
                >
                </GoogleMap>
              )}
            </div>

            {/* Panel lateral — oculto en mobile via CSS (.granja-side-panel) */}
            <div className="granja-side-panel" style={{ width: 272, borderLeft: '1px solid #F0F2F5', overflowY: 'auto', background: '#FAFAFA', flexShrink: 0 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F2F5', background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {selected ? 'Información del área' : 'Zonas de la granja'}
                </span>
                {!selected && (
                  <span style={{ fontSize: 10, color: '#C8D2E0', marginLeft: 6 }}>({zonas.length} zonas)</span>
                )}
              </div>

              {selected ? (
                <div style={{ padding: 14 }}>
                  <button
                    onClick={() => { setSelected(null); resetView(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#818EA3', marginBottom: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <i className="material-icons" style={{ fontSize: 15 }}>arrow_back</i> Todas las zonas
                  </button>

                  {/* Cabecera zona */}
                  <div style={{ background: `linear-gradient(135deg, ${selected.color}CC, ${selected.color}77)`, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="material-icons" style={{ color: '#fff', fontSize: 20 }}>{TIPO_ICON[selected.tipo]}</i>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{selected.nombre}</div>
                        {selected.superficie && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)' }}>{selected.superficie}</div>}
                      </div>
                    </div>
                    {/* Chips de info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                        {selected.tipo === 'lote' ? 'Lote productivo' : selected.tipo === 'estanque' ? 'Estanque' : selected.tipo === 'invernadero' ? 'Vivero' : 'Conservación'}
                      </span>
                      {selected.imagenes.length > 0 && (
                        <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                          <i className="material-icons" style={{ fontSize: 10, verticalAlign: 'middle', marginRight: 2 }}>photo_camera</i>
                          {selected.imagenes.length} foto(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  {selected.descripcion && (
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.75, marginBottom: 10 }}>
                      {selected.descripcion.length > 150 ? selected.descripcion.slice(0, 150) + '…' : selected.descripcion}
                    </p>
                  )}

                  {/* Datos técnicos */}
                  {selected.detalle && (
                    <div style={{ padding: '8px 10px', background: selected.color + '18', borderRadius: 8, borderLeft: `3px solid ${selected.color}`, marginBottom: 12 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Datos técnicos</div>
                      <p style={{ fontSize: 11, color: '#555', lineHeight: 1.65, marginBottom: 0 }}>{selected.detalle}</p>
                    </div>
                  )}

                  {/* Vista previa galería */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      <i className="material-icons" style={{ fontSize: 11, verticalAlign: 'middle', marginRight: 3 }}>photo_library</i>
                      Fotografías de la zona
                    </div>
                    {selected.imagenes.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                        {selected.imagenes.slice(0, 4).map((img, i) => (
                          <div key={i} style={{ borderRadius: 7, overflow: 'hidden', border: '1px solid #E4E8EF', background: '#F0FAF4', height: 58 }}>
                            {img.startsWith('http') ? (
                              <img src={img} alt={`Foto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="material-icons" style={{ fontSize: 22, color: '#74C69D' }}>photo</i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                        {['135deg,#1B4332,#52B788','135deg,#2D6A4F,#95D5B2','135deg,#3D5170,#7A96C2','135deg,#7C2D12,#F97316'].map((g, i) => (
                          <div key={i} style={{ borderRadius: 7, background: `linear-gradient(${g})`, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.55 }}>
                            <i className="material-icons" style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)' }}>photo_camera</i>
                          </div>
                        ))}
                      </div>
                    )}
                    {selected.imagenes.length === 0 && (
                      <div style={{ fontSize: 9, color: '#B0B8C4', textAlign: 'center', marginTop: 4 }}>Vista previa — fotos disponibles en la ficha completa</div>
                    )}
                  </div>

                  {/* Botón ficha completa */}
                  <button
                    onClick={() => navigate(ROUTES.ZONAS)}
                    style={{ width: '100%', padding: '9px', borderRadius: 9, border: `1px solid ${selected.color}`, background: selected.color + '12', color: selected.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <i className="material-icons" style={{ fontSize: 15 }}>open_in_new</i>
                    Ver ficha completa
                  </button>
                </div>
              ) : (
                zonas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => flyToArea(area)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F0F2F5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: area.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="material-icons" style={{ color: area.color, fontSize: 16 }}>{TIPO_ICON[area.tipo]}</i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#3D5170' }}>{area.nombre}</div>
                      <div style={{ fontSize: 10, color: '#818EA3' }}>{area.superficie ?? area.tipo}</div>
                    </div>
                    <i className="material-icons" style={{ fontSize: 16, color: '#C8D2E0', flexShrink: 0 }}>chevron_right</i>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            LEYENDA DEL MAPA
        ══════════════════════════════════════════════ */}
        <div style={{ background: '#fff', border: '1px solid #E4E8EF', borderRadius: 14, padding: '1.1rem 1.5rem', marginBottom: 28, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 8, flexShrink: 0 }}>Leyenda:</span>
          {[
            { color: C.verde,   label: 'Lotes productivos' },
            { color: '#DDA15E', label: 'Parcelas demostrativas' },
            { color: '#FBBF24', label: 'Cultivo de mango' },
            { color: '#0369A1', label: 'Estanques / reservorios' },
            { color: '#7C3AED', label: 'Vivero' },
            { color: '#134E1B', label: 'Islas / conservación' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#F8F9FA', borderRadius: 20, border: '1px solid #EAEDF0' }}>
              <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#5A6169' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            DATOS CURIOSOS
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="material-icons" style={{ color: '#fff', fontSize: 18 }}>lightbulb</i>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 1 }}>¿Sabías que?</p>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: '#3D5170', margin: 0 }}>Datos curiosos de la granja</h4>
            </div>
          </div>
          <div className="row" style={{ gap: 0 }}>
            {CURIOSIDADES.map((d, i) => (
              <div key={d.icon} className="col-12 col-md-6 col-lg-4 mb-3">
                <div style={{
                  height: '100%', padding: '1.1rem 1.3rem',
                  background: '#fff', border: '1px solid #E4E8EF', borderRadius: 12,
                  borderTop: `3px solid ${['#2D6A4F','#C8A84B','#8B1A1A','#1E40AF','#7C3AED','#92400E'][i % 6]}`,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: ['#F0F7F4','#FDF6E3','#FEF2F2','#EFF6FF','#F5F3FF','#FFF7ED'][i % 6],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <i className="material-icons" style={{ color: ['#2D6A4F','#C8A84B','#8B1A1A','#1E40AF','#7C3AED','#92400E'][i % 6], fontSize: 18 }}>{d.icon}</i>
                    </div>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.8, marginBottom: 0, paddingTop: 4 }}>{d.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            HOJA DE RUTA
        ══════════════════════════════════════════════ */}
        <div style={{
          borderRadius: 14, overflow: 'hidden', marginBottom: 8,
          background: 'linear-gradient(135deg, #3D3000 0%, #5C4A00 40%, #7A6020 100%)',
          padding: '1.8rem 2rem', position: 'relative',
        }}>
          {/* Decorativo */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,168,75,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <i className="material-icons" style={{ color: '#C8A84B', fontSize: 22 }}>rocket_launch</i>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(200,168,75,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 0 }}>Próximamente</p>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#C8A84B', margin: 0 }}>Funcionalidades en desarrollo</h4>
              </div>
            </div>
            <div className="row">
              {[
                { icon: 'photo_library', title: 'Galería multimedia',   text: 'Fotos y videos reales subidos desde administración' },
                { icon: 'terrain',       title: 'Modelo 3D del terreno', text: 'Datos de elevación DEM del IGAC en tiempo real' },
                { icon: 'sensors',       title: 'Sensores IoT',          text: 'Temperatura, humedad y nutrientes por lote' },
                { icon: 'edit_location', title: 'Gestión de zonas',      text: 'Asignación dinámica de cultivos y responsables' },
              ].map(r => (
                <div key={r.icon} className="col-12 col-sm-6 mb-3">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="material-icons" style={{ color: '#C8A84B', fontSize: 18 }}>{r.icon}</i>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{r.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>

    {/* ── MOBILE: Botón flotante "Ver zonas" ── */}
    {isMobile && (
      <button
        onClick={() => setShowListSheet(true)}
        style={{
          position: 'fixed', bottom: 24, right: 20, zIndex: 1040,
          background: 'var(--usco-red)', color: '#fff',
          border: 'none', borderRadius: 28,
          padding: '11px 20px', boxShadow: '0 4px 20px rgba(139,26,26,0.45)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        <i className="material-icons" style={{ fontSize: 18 }}>layers</i>
        Ver zonas
      </button>
    )}

    {/* ── MOBILE: Bottom sheet — lista de zonas ── */}
    {isMobile && showListSheet && (
      <>
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1045 }}
          onClick={() => setShowListSheet(false)}
        />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1050,
          background: '#fff', borderRadius: '20px 20px 0 0',
          maxHeight: '72vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.22)',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D0D5DD' }} />
          </div>
          {/* Header */}
          <div style={{ padding: '10px 20px 12px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3D5170' }}>
              Zonas de la granja
              <span style={{ fontSize: 11, color: '#818EA3', fontWeight: 400, marginLeft: 6 }}>({zonas.length} zonas)</span>
            </span>
            <button onClick={() => setShowListSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818EA3', padding: 4 }}>
              <i className="material-icons" style={{ fontSize: 20 }}>close</i>
            </button>
          </div>
          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {zonas.map(area => (
              <button
                key={area.id}
                onClick={() => flyToArea(area)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: area.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="material-icons" style={{ color: area.color, fontSize: 18 }}>{TIPO_ICON[area.tipo]}</i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#3D5170' }}>{area.nombre}</div>
                  <div style={{ fontSize: 11, color: '#818EA3' }}>{area.superficie ?? area.tipo}</div>
                </div>
                <i className="material-icons" style={{ fontSize: 18, color: '#C8D2E0' }}>chevron_right</i>
              </button>
            ))}
          </div>
        </div>
      </>
    )}

    {/* ── MOBILE: Bottom sheet — detalle de zona seleccionada ── */}
    {isMobile && showZonaSheet && selected && (
      <>
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1045 }}
          onClick={() => setShowZonaSheet(false)}
        />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1050,
          background: '#fff', borderRadius: '20px 20px 0 0',
          maxHeight: '75vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.22)',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px', flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D0D5DD' }} />
          </div>
          {/* Header */}
          <div style={{ padding: '8px 20px 12px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <button
              onClick={() => { setShowZonaSheet(false); setShowListSheet(true); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#818EA3', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <i className="material-icons" style={{ fontSize: 16 }}>arrow_back</i> Todas las zonas
            </button>
            <button onClick={() => { setShowZonaSheet(false); setSelected(null); resetView(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818EA3', padding: 4 }}>
              <i className="material-icons" style={{ fontSize: 20 }}>close</i>
            </button>
          </div>
          {/* Contenido */}
          <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
            {/* Cabecera colorida */}
            <div style={{ background: `linear-gradient(135deg, ${selected.color}CC, ${selected.color}77)`, borderRadius: 14, padding: '14px 16px 12px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="material-icons" style={{ color: '#fff', fontSize: 22 }}>{TIPO_ICON[selected.tipo]}</i>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{selected.nombre}</div>
                  {selected.superficie && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)' }}>{selected.superficie}</div>}
                </div>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                {selected.tipo === 'lote' ? 'Lote productivo' : selected.tipo === 'estanque' ? 'Estanque' : selected.tipo === 'invernadero' ? 'Vivero' : 'Conservación'}
              </span>
            </div>

            {selected.descripcion && (
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.75, marginBottom: 12 }}>
                {selected.descripcion.length > 200 ? selected.descripcion.slice(0, 200) + '…' : selected.descripcion}
              </p>
            )}

            {selected.detalle && (
              <div style={{ padding: '10px 12px', background: selected.color + '18', borderRadius: 8, borderLeft: `3px solid ${selected.color}`, marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Datos técnicos</div>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65, marginBottom: 0 }}>{selected.detalle}</p>
              </div>
            )}

            <button
              onClick={() => navigate(ROUTES.ZONAS)}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: `1.5px solid ${selected.color}`, background: selected.color + '12', color: selected.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
            >
              <i className="material-icons" style={{ fontSize: 16 }}>open_in_new</i>
              Ver ficha completa
            </button>
          </div>
        </div>
      </>
    )}

    {/* Portal: panel de zona en pantalla completa — se inyecta dentro del elemento fullscreen real */}
    {fsElement && selected && createPortal(
      <div style={{
        position: 'absolute', top: 12, right: 12, width: 290,
        maxHeight: 'calc(100% - 80px)',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 14,
        boxShadow: '0 8px 36px rgba(0,0,0,0.35)',
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: 'inherit',
      }}>
        {/* Header */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', borderRadius: '14px 14px 0 0', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Información del área</span>
          <button onClick={() => { setSelected(null); resetView(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818EA3', padding: 0, display: 'flex' }}>
            <i className="material-icons" style={{ fontSize: 18 }}>close</i>
          </button>
        </div>

        <div style={{ padding: 14 }}>
          {/* Cabecera colorida */}
          <div style={{ background: `linear-gradient(135deg, ${selected.color}CC, ${selected.color}77)`, borderRadius: 12, padding: '14px 14px 12px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="material-icons" style={{ color: '#fff', fontSize: 20 }}>{TIPO_ICON[selected.tipo]}</i>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{selected.nombre}</div>
                {selected.superficie && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)' }}>{selected.superficie}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                {selected.tipo === 'lote' ? 'Lote productivo' : selected.tipo === 'estanque' ? 'Estanque' : selected.tipo === 'invernadero' ? 'Vivero' : 'Conservación'}
              </span>
              {selected.imagenes.length > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                  <i className="material-icons" style={{ fontSize: 10, verticalAlign: 'middle', marginRight: 2 }}>photo_camera</i>
                  {selected.imagenes.length} foto(s)
                </span>
              )}
            </div>
          </div>

          {/* Descripción */}
          {selected.descripcion && (
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.75, marginBottom: 10 }}>
              {selected.descripcion.length > 160 ? selected.descripcion.slice(0, 160) + '…' : selected.descripcion}
            </p>
          )}

          {/* Datos técnicos */}
          {selected.detalle && (
            <div style={{ padding: '8px 10px', background: selected.color + '18', borderRadius: 8, borderLeft: `3px solid ${selected.color}`, marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Datos técnicos</div>
              <p style={{ fontSize: 11, color: '#555', lineHeight: 1.65, marginBottom: 0 }}>{selected.detalle}</p>
            </div>
          )}

          {/* Fotos */}
          {selected.imagenes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                <i className="material-icons" style={{ fontSize: 11, verticalAlign: 'middle', marginRight: 3 }}>photo_library</i>
                Fotografías
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {selected.imagenes.slice(0, 4).map((img, i) => (
                  <div key={i} style={{ borderRadius: 7, overflow: 'hidden', border: '1px solid #E4E8EF', height: 66 }}>
                    {img.startsWith('http') ? (
                      <img src={img} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FAF4' }}>
                        <i className="material-icons" style={{ fontSize: 22, color: '#74C69D' }}>photo</i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón */}
          <button
            onClick={() => navigate(ROUTES.ZONAS)}
            style={{ width: '100%', padding: '9px', borderRadius: 9, border: `1px solid ${selected.color}`, background: selected.color + '12', color: selected.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <i className="material-icons" style={{ fontSize: 15 }}>open_in_new</i>
            Ver ficha completa
          </button>
        </div>
      </div>,
      fsElement
    )}
    </>
  );
}
