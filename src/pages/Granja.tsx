import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { C } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import Header from '@/components/layout/Header';
import granjaRaw from '@/data/granja.json';
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

const STATS = [
  { icon: 'landscape',      label: 'Área total',           value: '15 ha',    color: C.verde },
  { icon: 'grass',          label: 'Lotes productivos',    value: '15',       color: '#52B788' },
  { icon: 'water',          label: 'Estanques / reserv.',  value: '4',        color: '#1E40AF' },
  { icon: 'agriculture',    label: 'Maquinaria',           value: '4 equipos',color: '#92400E' },
  { icon: 'calendar_today', label: 'Años de operación',    value: '40+',      color: '#8B1A1A' },
  { icon: 'science',        label: 'Proyectos activos',    value: '8',        color: '#7C3AED' },
];

const GALLERY = [
  { icon: 'grass',       label: 'Cultivos en producción', g: '135deg,#1B4332,#52B788' },
  { icon: 'water',       label: 'Estanques piscícolas',   g: '135deg,#1E3A8A,#60A5FA' },
  { icon: 'agriculture', label: 'Maquinaria agrícola',    g: '135deg,#7C2D12,#F97316' },
  { icon: 'eco',         label: 'Invernadero y vivero',   g: '135deg,#14532D,#86EFAC' },
  { icon: 'science',     label: 'Laboratorio de suelos',  g: '135deg,#4C1D95,#A78BFA' },
  { icon: 'groups',      label: 'Prácticas académicas',   g: '135deg,#7F1D1D,#FCA5A5' },
];

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
  const [selected,    setSelected]    = useState<AreaInfo | null>(null);
  const [zona,        setZona]        = useState<string | null>(null);
  const [geoErr,      setGeoErr]      = useState('');
  const [geoLoading,  setGeoLoading]  = useState(false);
  const [map,       setMap]       = useState<google.maps.Map | null>(null);
  const [userPos,   setUserPos]   = useState<google.maps.LatLngLiteral | null>(null);
  const [fsElement, setFsElement] = useState<Element | null>(null);
  const zonas = zonasService.getAll();

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
        <Header
          title="La Granja"
          subtitle="Granja Experimental USCO — Neiva, Huila · Conoce nuestras instalaciones"
        />

        {/* ── Stats ── */}
        <div className="row mb-4">
          {STATS.map(s => (
            <div key={s.label} className="col-6 col-md-4 col-lg-2 mb-3">
              <div className="card h-100" style={{ padding: '0.85rem 1rem' }}>
                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="material-icons" style={{ color: s.color, fontSize: 20 }}>{s.icon}</i>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#3D5170', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#818EA3', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quiénes somos + Misión/Visión ── */}
        <div className="row mb-4">
          <div className="col-12 col-md-7 mb-4 mb-md-0">
            <div className="card h-100" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quiénes somos</div>
              <h5 style={{ color: '#3D5170', fontWeight: 700, marginBottom: 10 }}>Granja Experimental USCO</h5>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.85, marginBottom: 10 }}>
                La Granja Experimental de la Universidad Surcolombiana es un centro de investigación, docencia y extensión agropecuaria ubicado en Neiva, Huila. Con más de 40 años de trayectoria, es el laboratorio a cielo abierto de los programas de Ingeniería Agronómica, Zootecnia y Biología.
              </p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.85, marginBottom: 0 }}>
                Cuenta con <strong>15 lotes y parcelas productivas</strong>, 4 reservorios piscícolas, un vivero, laboratorios de suelos y agua, y una flota de maquinaria agrícola.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-5">
            <div className="d-flex flex-column h-100" style={{ gap: 12 }}>
              <div className="card flex-fill" style={{ padding: '1.1rem 1.3rem', borderLeft: `4px solid ${C.verde}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.verde, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Misión</div>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.78, marginBottom: 0 }}>
                  Apoyar la formación integral mediante prácticas agropecuarias sostenibles, fomentando la investigación científica y la transferencia de tecnología a las comunidades rurales del Huila.
                </p>
              </div>
              <div className="card flex-fill" style={{ padding: '1.1rem 1.3rem', borderLeft: '4px solid #C8A84B' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#C8A84B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Visión</div>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.78, marginBottom: 0 }}>
                  Ser referente regional en investigación agropecuaria sostenible, articulando ciencia, tecnología y saberes ancestrales para contribuir a la seguridad alimentaria del sur colombiano.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Galería ── */}
        <div className="card mb-4" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Galería</div>
          <div className="row">
            {GALLERY.map(item => (
              <div key={item.label} className="col-6 col-md-4 mb-3">
                <div
                  style={{ borderRadius: 12, background: `linear-gradient(${item.g})`, height: 108, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <i className="material-icons" style={{ color: 'rgba(255,255,255,0.92)', fontSize: 34 }}>{item.icon}</i>
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: 600, textAlign: 'center', padding: '0 10px' }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#818EA3', marginTop: 4, marginBottom: 0, textAlign: 'center' }}>
            Galería multimedia en desarrollo — próximamente fotos y videos reales de la granja.
          </p>
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
                <button className="btn btn-sm" style={{ background: C.verde, color: '#fff', borderRadius: 20, border: 'none' }} onClick={() => navigate(ROUTES.ZONAS)}>
                  <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>layers</i>
                  Ver zonas
                </button>
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

            {/* Panel lateral */}
            <div style={{ width: 272, borderLeft: '1px solid #F0F2F5', overflowY: 'auto', background: '#FAFAFA', flexShrink: 0 }}>
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

        {/* ── Leyenda ── */}
        <div className="card mb-4" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Leyenda del mapa</div>
          <div className="d-flex flex-wrap" style={{ gap: 14 }}>
            {[
              { color: C.verde,   label: 'Lotes productivos' },
              { color: '#DDA15E', label: 'Parcelas demostrativas' },
              { color: '#FBBF24', label: 'Cultivo de mango' },
              { color: '#0369A1', label: 'Estanques / reservorios' },
              { color: '#7C3AED', label: 'Vivero' },
              { color: '#134E1B', label: 'Islas / conservación' },
            ].map(l => (
              <div key={l.label} className="d-flex align-items-center" style={{ gap: 6 }}>
                <div style={{ width: 14, height: 14, background: l.color, borderRadius: 3 }} />
                <span style={{ fontSize: 11, color: '#555' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Datos curiosos ── */}
        <div className="card mb-4" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Datos curiosos</div>
          <div className="row">
            {CURIOSIDADES.map(d => (
              <div key={d.icon} className="col-12 col-md-6 mb-3">
                <div className="d-flex" style={{ gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="material-icons" style={{ color: C.verde, fontSize: 18 }}>{d.icon}</i>
                  </div>
                  <p style={{ fontSize: 12, color: '#555', lineHeight: 1.78, marginBottom: 0, paddingTop: 7 }}>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hoja de ruta ── */}
        <div className="card mt-2" style={{ padding: '1rem 1.5rem', borderLeft: '4px solid #C8A84B', background: '#FDFAF4' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C8A84B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            <i className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>tips_and_updates</i>
            Hoja de ruta — funcionalidades futuras
          </div>
          <div className="row">
            {[
              { icon: 'photo_library', text: 'Galería multimedia real con fotos y videos subidos desde administración' },
              { icon: 'terrain',       text: 'Terreno 3D real con datos de elevación DEM del IGAC' },
              { icon: 'sensors',       text: 'Integración con sensores IoT de suelo, temperatura y humedad por lote' },
              { icon: 'edit_location', text: 'Edición de zonas y asignación dinámica de cultivos por lote' },
            ].map(r => (
              <div key={r.icon} className="col-12 col-md-6 mb-2">
                <div className="d-flex align-items-start" style={{ gap: 8 }}>
                  <i className="material-icons" style={{ color: '#C8A84B', fontSize: 16, marginTop: 2, flexShrink: 0 }}>{r.icon}</i>
                  <span style={{ fontSize: 12, color: '#7A6020' }}>{r.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>

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
