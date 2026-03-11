export type ZonaTipo = 'lote' | 'estanque' | 'invernadero' | 'isla';

export interface ZonaInfo {
  id: string;
  nombre: string;
  tipo: ZonaTipo;
  color: string;
  lineColor: string;
  superficie?: string;
  descripcion?: string;
  detalle?: string;
  imagenes: string[];
}

let store: ZonaInfo[] = [
  { id: 'LOTE_E1',  nombre: 'Lote E1',  tipo: 'lote', color: '#2D6A4F', lineColor: '#ffffff', superficie: '5.290 m²',
    descripcion: 'Lote Experimental N.° 1 con sistema de riego por microaspersión (7 m × 7 m). Proyectado para siembra asociada de plátano y cacao.',
    detalle: 'Microaspersores: diámetro de mojado 7 m, caudal 70 L/h, presión 40 m.c.a.',
    imagenes: [
      'https://images.unsplash.com/photo-1587483166702-bf9aa66bd791?w=800&q=80',
      'https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=800&q=80',
      'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=800&q=80',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    ] },
  { id: 'LOTE_E2',  nombre: 'Lote E2',  tipo: 'lote', color: '#52B788', lineColor: '#ff0000', superficie: '~2 ha',
    descripcion: 'Lote experimental de producción agrícola. Utilizado principalmente para prácticas de labranza y manejo de cultivos de pancoger.', imagenes: [] },
  { id: 'LOTE_E3',  nombre: 'Lote E3',  tipo: 'lote', color: '#40916C', lineColor: '#aa007f', superficie: '~1.5 ha',
    descripcion: 'Lote experimental de producción agrícola. Zona de rotación de cultivos con énfasis en leguminosas y cereales.', imagenes: [] },
  { id: 'LOTE_E4',  nombre: 'Lote E4',  tipo: 'lote', color: '#1B4332', lineColor: '#ffff00', superficie: '~1.8 ha',
    descripcion: 'Horticultura intensiva: tomate, ají, habichuela.',
    detalle: 'Sistema hidropónico NFT en etapa piloto. Proyecto de riego solar 2023–2025.', imagenes: [] },
  { id: 'LOTE_E5',  nombre: 'Lote E5',  tipo: 'lote', color: '#74C69D', lineColor: '#ffff00', superficie: '~0.5 ha',
    descripcion: 'Lote experimental con pasturas y rotación de cultivos. Zona de evaluación de variedades forrajeras.', imagenes: [] },
  { id: 'LOTE_E6',  nombre: 'Lote E6',  tipo: 'lote', color: '#95D5B2', lineColor: '#0000ff', superficie: '~1.5 ha',
    descripcion: 'Sistema agroforestal: cacao, plátano y árboles maderables.',
    detalle: 'Asociación cacao–plátano–cedro. Certificación orgánica en proceso.', imagenes: [] },
  { id: 'LOTE_EA',  nombre: 'Lote EA',  tipo: 'lote', color: '#386641', lineColor: '#aaff00', superficie: '~4 ha',
    descripcion: 'Lote de gran extensión con producción agrícola mixta. Principal zona de producción comercial de la granja.', imagenes: [] },
  { id: 'LOTE_EB',  nombre: 'Lote EB',  tipo: 'lote', color: '#6A994E', lineColor: '#ff0000', superficie: '~3.5 ha',
    descripcion: 'Lote productivo con pasturas mejoradas y cultivos de ciclo corto. Zona de pastoreo rotacional.', imagenes: [] },
  { id: 'LOTE_EC',  nombre: 'Lote EC',  tipo: 'lote', color: '#A7C957', lineColor: '#0000ff', superficie: '~4 ha',
    descripcion: 'Lote de gran extensión en producción agrícola activa. Maíz, sorgo y yuca en rotación semestral.', imagenes: [] },
  { id: 'LOTE_ED',  nombre: 'Lote ED',  tipo: 'lote', color: '#8B5E3C', lineColor: '#ffaaff', superficie: '~2.5 ha',
    descripcion: 'Lote experimental diversificado. Zona de transición entre sistemas productivos convencionales y agroecológicos.', imagenes: [] },
  { id: 'LOTE_EDP1', nombre: 'Parcela EDP1', tipo: 'lote', color: '#DDA15E', lineColor: '#ffaa00', superficie: '~0.8 ha',
    descripcion: 'Parcela demostrativa de producción agrícola. Utilizada para jornadas académicas con estudiantes de pregrado.', imagenes: [] },
  { id: 'LOTE_EDP2', nombre: 'Parcela EDP2', tipo: 'lote', color: '#E9C46A', lineColor: '#ff007f', superficie: '~0.8 ha',
    descripcion: 'Parcela demostrativa de producción agrícola. Cultivos de ciclo corto como maíz y fríjol.', imagenes: [] },
  { id: 'LOTE_EDP3', nombre: 'Parcela EDP3', tipo: 'lote', color: '#F4A261', lineColor: '#ff0000', superficie: '~0.8 ha',
    descripcion: 'Parcela demostrativa de producción agrícola. Zona de evaluación de fertilizantes orgánicos.', imagenes: [] },
  { id: 'LOTE_EDP4', nombre: 'Parcela EDP4', tipo: 'lote', color: '#E76F51', lineColor: '#00007f', superficie: '~0.6 ha',
    descripcion: 'Parcela demostrativa de producción agrícola. Ensayos de biofertilizantes y control biológico.', imagenes: [] },
  { id: 'LOTE_EDP5', nombre: 'Parcela EDP5', tipo: 'lote', color: '#D62828', lineColor: '#00aa00', superficie: '~0.5 ha',
    descripcion: 'Parcela demostrativa de producción agrícola. La más pequeña del complejo EDP, usada para ensayos comparativos.', imagenes: [] },
  { id: 'cultivo de mango granja usco', nombre: 'Cultivo de Mango', tipo: 'lote', color: '#FBBF24', lineColor: '#ff0000', superficie: '~2 ha',
    descripcion: 'Cultivo permanente de mango. Variedad Tommy Atkins y otros. Principal referente productivo de la granja con producción comercial y académica.',
    detalle: 'Referente productivo de la granja. Producción comercial y académica. Ciclo de cosecha: octubre–diciembre.',
    imagenes: [
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80',
      'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=800&q=80',
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80',
      'https://images.unsplash.com/photo-1590005024862-6b67679a29fb?w=800&q=80',
    ] },
  { id: 'reservorio_1', nombre: 'Reservorio 1', tipo: 'estanque', color: '#1E40AF', lineColor: '#00aaff', superficie: '~800 m²',
    descripcion: 'Reservorio de agua para riego y actividades piscícolas. Abastece los sistemas de riego del sector norte de la granja.',
    detalle: 'Capacidad: ~4.000 m³. Alimentado por gravedad desde canal de acequias. Nivel controlado mensualmente.', imagenes: [] },
  { id: 'reservorio_2', nombre: 'Reservorio 2', tipo: 'estanque', color: '#1D4ED8', lineColor: '#00aaff', superficie: '~600 m²',
    descripcion: 'Reservorio de agua para riego y actividades acuícolas. Zona central de abastecimiento hídrico.', imagenes: [] },
  { id: 'reservorio_3', nombre: 'Reservorio 3', tipo: 'estanque', color: '#2563EB', lineColor: '#00aaff', superficie: '~400 m²',
    descripcion: 'Reservorio de agua de menor capacidad. Complementa el sistema de riego de la zona sur.', imagenes: [] },
  { id: 'RESERVORIO_ESTACION_PISICOLA', nombre: 'Estación Piscícola', tipo: 'estanque', color: '#0369A1', lineColor: '#00aaff', superficie: '~1 ha',
    descripcion: 'Estación piscícola con producción de tilapia roja, cachama y bocachico. Principal actividad acuícola de la granja experimental.',
    detalle: 'Densidad de siembra: 5 peces/m². Ciclo productivo de 6 meses. Alimentación controlada con alimento balanceado.',
    imagenes: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      'https://images.unsplash.com/photo-1582101767680-57aac071f4d6?w=800&q=80',
    ] },
  { id: 'VIVERO', nombre: 'Vivero', tipo: 'invernadero', color: '#7C3AED', lineColor: '#ff55ff', superficie: '~500 m²',
    descripcion: 'Propagación de material vegetal certificado y producción de plántulas hortícolas. Centro de reproducción de especies nativas.',
    detalle: 'Capacidad: 5.000 plántulas/ciclo. Riego automático por nebulización. Temperatura controlada entre 22°C y 30°C.',
    imagenes: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4ffe0?w=800&q=80',
      'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
    ] },
  { id: 'ISLA_1', nombre: 'Isla 1', tipo: 'isla', color: '#134E1B', lineColor: '#55ff00', superficie: '~1 ha',
    descripcion: 'Zona de conservación de bosque nativo y biodiversidad. Corredor biológico del Alto Magdalena.',
    detalle: 'Zona de amortiguación. Monitoreo semestral con estudiantes de Biología. Avistamiento de más de 45 especies de aves.',
    imagenes: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80',
      'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=800&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    ] },
  { id: 'ISLA_2', nombre: 'Isla 2', tipo: 'isla', color: '#166534', lineColor: '#00ff00',
    descripcion: 'Zona de conservación natural. Fragmento de bosque secundario con alta diversidad florística.', imagenes: [] },
  { id: 'ISLA_3', nombre: 'Isla 3', tipo: 'isla', color: '#15803D', lineColor: '#00ff00',
    descripcion: 'Zona de conservación natural. Área de reforestación con especies nativas del piedemonte huilense.', imagenes: [] },
  { id: 'ISLA_4', nombre: 'Isla 4', tipo: 'isla', color: '#16A34A', lineColor: '#00ff00',
    descripcion: 'Zona de conservación natural. Conectividad ecológica entre fragmentos boscosos.', imagenes: [] },
];

export const zonasService = {
  getAll: (): ZonaInfo[] => [...store],
  getById: (id: string): ZonaInfo | undefined => store.find(z => z.id === id),
  update: (id: string, data: Partial<Omit<ZonaInfo, 'id' | 'tipo' | 'color' | 'lineColor'>>): ZonaInfo => {
    store = store.map(z => z.id === id ? { ...z, ...data } : z);
    return store.find(z => z.id === id)!;
  },
};
