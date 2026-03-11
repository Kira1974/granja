import type {
  Usuario,
  ActividadCoord,
  ItemInventario,
  MovimientoInventario,
  ActividadCultivo,
  RegistroTractor,
  RegistroCombustible,
} from '@/types';

export const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nombre: 'Miguel González', rol: 'coordinador', email: 'coord@usco.edu.co' },
  { id: 2, nombre: 'Luis Vargas',      rol: 'mayordomo',   email: 'mayordomo@usco.edu.co' },
  { id: 3, nombre: 'Jorge Díaz',       rol: 'operario',    email: 'operario1@usco.edu.co' },
  { id: 4, nombre: 'Ana Torres',       rol: 'estudiante',  email: 'estudiante@usco.edu.co' },
];

export const MOCK_ACTIVIDADES_COORD: ActividadCoord[] = [
  {
    id: 1,
    fecha: '2026-01-20',
    categoria: 'Administrativo',
    descripcion: 'Solicitud de contratación de dos operarios para la Granja Experimental, proyectada entre el 2 de febrero y el 30 de junio, para un total de 260 jornales.',
    responsable: 'Miguel González',
    fotos: ['foto_solicitud.jpg'],
    documentos: [],
  },
  {
    id: 2,
    fecha: '2026-01-26',
    categoria: 'Coordinación operativa',
    descripcion: 'Supervisión del inicio de la preparación del Lote E2 mediante el tractor Massey Ferguson 290, realizando dos pasadas con rastra.',
    responsable: 'Miguel González',
    fotos: ['foto_lote_e2.jpg'],
    documentos: [],
  },
  {
    id: 3,
    fecha: '2026-01-31',
    categoria: 'Técnico – infraestructura',
    descripcion: 'Supervisión de la visita de Semi Ingeniería para revisión del motor WEG 25HP y tablero eléctrico. Se determinó instalar arrancador estrella-triángulo.',
    responsable: 'Miguel González',
    fotos: ['foto_motor.jpg', 'foto_tablero.jpg'],
    documentos: [],
  },
  {
    id: 4,
    fecha: '2026-02-11',
    categoria: 'Académico – formativo',
    descripcion: 'Acompañamiento a práctica del curso de Maquinaria Agrícola: labranza primaria con arado de vertedera, labranza secundaria con rastra y uso de motoazada.',
    responsable: 'Miguel González',
    fotos: ['foto_practica.jpg'],
    documentos: [],
  },
  {
    id: 5,
    fecha: '2026-03-04',
    categoria: 'Académico – formativo',
    descripcion: 'Práctica de Maquinaria Agrícola sobre calibración de equipos de aspersión: aforación de boquillas cónicas, de abanico y tipo espejo.',
    responsable: 'Miguel González',
    fotos: ['foto_fumigadoras.jpg', 'foto_boquillas.jpg'],
    documentos: ['informe_calibracion.pdf'],
  },
];

export const MOCK_INVENTARIO: ItemInventario[] = [
  { id: 1, tipo: 'insumo',      nombre: 'Touchdown',                   unidad: 'Litros', cantidad: 80,  estado: 'Disponible',    ultimoUso: '2026-02-16', categoria: 'Herbicida',       codigo: 'INS-001', proveedor: 'AgroInsumos del Sur', stockMinimo: 20 },
  { id: 2, tipo: 'insumo',      nombre: 'DAP Granulado x50kg',         unidad: 'Bultos', cantidad: 57,  estado: 'Disponible',    ultimoUso: '2026-02-19', categoria: 'Fertilizante',    codigo: 'INS-002', proveedor: 'Fertiandes S.A.',     stockMinimo: 10 },
  { id: 3, tipo: 'insumo',      nombre: 'Dual Gold',                   unidad: 'Litros', cantidad: 19,  estado: 'Bajo stock',    ultimoUso: '2026-02-16', categoria: 'Herbicida',       codigo: 'INS-003', proveedor: 'AgroInsumos del Sur', stockMinimo: 25 },
  { id: 4, tipo: 'insumo',      nombre: 'Semilla FEDEA 2020',          unidad: 'Bultos', cantidad: 13,  estado: 'Disponible',    ultimoUso: '2026-02-11', categoria: 'Semilla',         codigo: 'INS-004', proveedor: 'FEDEA Colombia',      stockMinimo: 5 },
  { id: 5, tipo: 'maquinaria',  nombre: 'Tractor Massey Ferguson 290', unidad: '—',      cantidad: 1,   estado: 'Operativo',     ultimoUso: '2026-03-03', categoria: 'Maquinaria pesada', codigo: 'MAQ-001', proveedor: 'AGCO Colombia' },
  { id: 6, tipo: 'maquinaria',  nombre: 'Fumigadora motorizada',       unidad: '—',      cantidad: 3,   estado: 'Mantenimiento', ultimoUso: '2026-02-10', categoria: 'Aplicación',      codigo: 'MAQ-002', proveedor: 'Jacto Colombia' },
  { id: 7, tipo: 'maquinaria',  nombre: 'Motocultor',                  unidad: '—',      cantidad: 1,   estado: 'Operativo',     ultimoUso: '2026-02-06', categoria: 'Labranza',        codigo: 'MAQ-003', proveedor: 'Honda Colombia' },
  { id: 8, tipo: 'herramienta', nombre: 'Guadaña',                     unidad: 'Unidad', cantidad: 4,   estado: 'Disponible',    ultimoUso: '2026-03-05', categoria: 'Corte',           codigo: 'HER-001', proveedor: 'Ferrelectricos Neiva' },
  { id: 9, tipo: 'herramienta', nombre: 'Hoyadora motorizada',         unidad: 'Unidad', cantidad: 1,   estado: 'Disponible',    ultimoUso: '2026-02-21', categoria: 'Siembra',         codigo: 'HER-002', proveedor: 'AgroTools Ltda.' },
];

export const MOCK_MOVIMIENTOS: Record<number, MovimientoInventario[]> = {
  1: [
    { id: 1, fecha: '2026-02-16', accion: 'Uso en campo',          actividad: 'Aplicación herbicida Lote E2',      responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 5,  stockAntes: 85,  stockDespues: 80 },
    { id: 2, fecha: '2026-01-10', accion: 'Ingreso al inventario', actividad: 'Compra por licitación 2026-I',      responsable: 'Miguel González', vigilante: 'Ana Muñoz',  cantidadMovida: 85, stockAntes: 0,   stockDespues: 85 },
  ],
  2: [
    { id: 1,  fecha: '2026-02-24', accion: 'Uso en campo',          actividad: 'Segunda fertilización Lote E2 – maíz',          responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 58,  stockDespues: 57 },
    { id: 2,  fecha: '2026-02-21', accion: 'Uso en campo',          actividad: 'Fertilización siembra plátano Lote E1',          responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 59,  stockDespues: 58 },
    { id: 3,  fecha: '2026-02-19', accion: 'Uso en campo',          actividad: 'Abonado cacao Lote E1 – etapa establecimiento',  responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 2,  stockAntes: 61,  stockDespues: 59 },
    { id: 4,  fecha: '2026-02-14', accion: 'Uso en campo',          actividad: 'Fertilización maíz Lote E2 – 10 dds',           responsable: 'Jorge Díaz',      vigilante: 'Ana Muñoz',  cantidadMovida: 1,  stockAntes: 62,  stockDespues: 61 },
    { id: 5,  fecha: '2026-02-10', accion: 'Uso en campo',          actividad: 'Abonado yuca Lote E5 – inicio ciclo',           responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 2,  stockAntes: 64,  stockDespues: 62 },
    { id: 6,  fecha: '2026-02-06', accion: 'Uso en campo',          actividad: 'Fertilización plátano Lote E4 – reabonada',     responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 3,  stockAntes: 67,  stockDespues: 64 },
    { id: 7,  fecha: '2026-02-03', accion: 'Uso en campo',          actividad: 'Fertilización maíz Lote E6 – pre-siembra',      responsable: 'Jorge Díaz',      vigilante: 'Ana Muñoz',  cantidadMovida: 2,  stockAntes: 69,  stockDespues: 67 },
    { id: 8,  fecha: '2026-01-28', accion: 'Uso en campo',          actividad: 'Aplicación DAP hoyo – siembra maíz E2',         responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 70,  stockDespues: 69 },
    { id: 9,  fecha: '2026-01-22', accion: 'Uso en campo',          actividad: 'Abonado cacao Lote E1 – vivero',                responsable: 'Luis Vargas',     vigilante: 'Ana Muñoz',  cantidadMovida: 2,  stockAntes: 72,  stockDespues: 70 },
    { id: 10, fecha: '2026-01-17', accion: 'Uso en campo',          actividad: 'Fertilización yuca Lote E5 – semana 2',         responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 3,  stockAntes: 75,  stockDespues: 72 },
    { id: 11, fecha: '2026-01-13', accion: 'Ingreso al inventario', actividad: 'Reposición parcial – compra directa',           responsable: 'Miguel González', vigilante: 'Ana Muñoz',  cantidadMovida: 15, stockAntes: 60,  stockDespues: 75 },
    { id: 12, fecha: '2025-12-18', accion: 'Uso en campo',          actividad: 'Fertilización final plátano Lote E4',           responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 4,  stockAntes: 64,  stockDespues: 60 },
    { id: 13, fecha: '2025-12-10', accion: 'Uso en campo',          actividad: 'Abonado cacao Lote E1 – 3er ciclo',             responsable: 'Luis Vargas',     vigilante: 'Ana Muñoz',  cantidadMovida: 2,  stockAntes: 66,  stockDespues: 64 },
    { id: 14, fecha: '2025-12-03', accion: 'Uso en campo',          actividad: 'Fertilización maíz Lote E6 – emergencia',       responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 3,  stockAntes: 69,  stockDespues: 66 },
    { id: 15, fecha: '2025-11-25', accion: 'Uso en campo',          actividad: 'Fertilización yuca Lote E5 – semana 6',         responsable: 'Jorge Díaz',      vigilante: 'Ana Muñoz',  cantidadMovida: 3,  stockAntes: 72,  stockDespues: 69 },
    { id: 16, fecha: '2025-11-12', accion: 'Ingreso al inventario', actividad: 'Compra licitación 2025-II – Fertiandes S.A.',   responsable: 'Miguel González', vigilante: 'Ana Muñoz',  cantidadMovida: 80, stockAntes: 0,   stockDespues: 80 },
  ],
  3: [
    { id: 1, fecha: '2026-02-16', accion: 'Uso en campo',          actividad: 'Aplicación herbicida preemergente', responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 6,  stockAntes: 25,  stockDespues: 19 },
    { id: 2, fecha: '2026-01-10', accion: 'Ingreso al inventario', actividad: 'Compra por licitación 2026-I',      responsable: 'Miguel González', vigilante: 'Ana Muñoz',  cantidadMovida: 25, stockAntes: 0,   stockDespues: 25 },
  ],
  4: [
    { id: 1, fecha: '2026-02-11', accion: 'Uso en campo',          actividad: 'Siembra Lote E2 – maíz FEDEA',      responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 2,  stockAntes: 15,  stockDespues: 13 },
    { id: 2, fecha: '2026-01-15', accion: 'Ingreso al inventario', actividad: 'Compra FEDEA lote 2026-I',          responsable: 'Miguel González', vigilante: 'Ana Muñoz',  cantidadMovida: 15, stockAntes: 0,   stockDespues: 15 },
  ],
  5: [
    { id: 1, fecha: '2026-03-02', accion: 'Uso en campo',          actividad: 'Adecuación Lote E3 – roto speed',   responsable: 'Luis Vargas',     vigilante: 'Ana Muñoz',  cantidadMovida: 1,  stockAntes: 1,   stockDespues: 1 },
    { id: 2, fecha: '2026-02-11', accion: 'Uso en campo',          actividad: 'Conformación surcos Lote E2',       responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 1,   stockDespues: 1 },
    { id: 3, fecha: '2026-01-26', accion: 'Uso en campo',          actividad: 'Preparación Lote E2 – dos pasadas', responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 1,   stockDespues: 1 },
  ],
  6: [
    { id: 1, fecha: '2026-02-16', accion: 'Uso en campo',          actividad: 'Aplicación herbicida Lote E2',      responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 2,  stockAntes: 3,   stockDespues: 3 },
    { id: 2, fecha: '2026-02-10', accion: 'Mantenimiento',         actividad: 'Revisión boquillas y filtros',      responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 0,  stockAntes: 3,   stockDespues: 3 },
  ],
  7: [
    { id: 1, fecha: '2026-02-06', accion: 'Uso en campo',          actividad: 'Labranza secundaria Lote E3',       responsable: 'Luis Vargas',     vigilante: 'Ana Muñoz',  cantidadMovida: 1,  stockAntes: 1,   stockDespues: 1 },
  ],
  8: [
    { id: 1, fecha: '2026-03-05', accion: 'Uso en campo',          actividad: 'Deshierbe bordes Lote E1',          responsable: 'Jorge Díaz',      vigilante: 'Pedro Ríos', cantidadMovida: 2,  stockAntes: 4,   stockDespues: 4 },
    { id: 2, fecha: '2026-02-18', accion: 'Uso en campo',          actividad: 'Corte de maleza perímetro',         responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 3,  stockAntes: 4,   stockDespues: 4 },
  ],
  9: [
    { id: 1, fecha: '2026-02-21', accion: 'Uso en campo',          actividad: 'Hoyado para siembra plátano E1',    responsable: 'Luis Vargas',     vigilante: 'Pedro Ríos', cantidadMovida: 1,  stockAntes: 1,   stockDespues: 1 },
  ],
};

export const MOCK_ACTIVIDADES_CULTIVO: ActividadCultivo[] = [
  {
    id: 1,
    lote: 'Lote E2 – Maíz',
    fecha: '2026-02-16',
    actividad: 'Aplicación herbicida preemergente',
    insumos: ['Dual Gold 200ml/bomba – 25L total'],
    equipo: 'Fumigadora de espalda',
    responsable: 'Jorge Díaz',
    horaInicio: '06:30',
    horaFin: '09:00',
    observaciones: 'Aplicación previa a emergencia para control de malezas.',
    complementoCoord: 'Verificar emergencia del cultivo en 5 días.',
    fotos: ['foto_herbicida.jpg'],
    documentos: [],
  },
  {
    id: 2,
    lote: 'Lote E2 – Maíz',
    fecha: '2026-02-24',
    actividad: 'Primera fertilización',
    insumos: ['DAP 1 bulto – área total'],
    equipo: 'Manual',
    responsable: 'Jorge Díaz',
    horaInicio: '07:00',
    horaFin: '10:00',
    observaciones: 'Aplicación al voleo en etapa temprana del cultivo.',
    complementoCoord: '',
    fotos: ['foto_fertilizacion.jpg', 'foto_voleo.jpg'],
    documentos: [],
  },
  {
    id: 3,
    lote: 'Lote E1 – Plátano/Cacao',
    fecha: '2026-02-21',
    actividad: 'Trazado y siembra de plátano',
    insumos: ['DAP 50g/hoyo – 62 plantas'],
    equipo: 'Hoyadora motorizada',
    responsable: 'Luis Vargas',
    horaInicio: '07:00',
    horaFin: '12:30',
    observaciones: 'Hoyos de 30x30cm. Se sembraron 62 plántulas Dominico Hartón.',
    complementoCoord: 'Programar riego de establecimiento.',
    fotos: ['foto_siembra_platano.jpg'],
    documentos: [],
  },
];

export const MOCK_TRACTOR: RegistroTractor[] = [
  { id: 1, fecha: '2026-01-26', actividad: 'Preparación Lote E2 – dos pasadas con rastra',  horaInicio: '07:00', horaFin: '12:00', total: '5.0h', operario: 'Luis Vargas', observaciones: 'Sin novedad mecánica.', fotos: [] },
  { id: 2, fecha: '2026-02-11', actividad: 'Conformación surcos Lote E2 con caballoneador', horaInicio: '06:30', horaFin: '11:00', total: '4.5h', operario: 'Luis Vargas', observaciones: 'Distanciamiento definido para siembra de maíz.', fotos: [] },
  { id: 3, fecha: '2026-03-02', actividad: 'Adecuación Lote E3 con roto speed',             horaInicio: '08:00', horaFin: '11:00', total: '3.0h', operario: 'Luis Vargas', observaciones: 'Apoyo a proyecto de grado de estudiantes.', fotos: [] },
];

export interface RegistroAuditoria {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  rol: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

export const MOCK_AUDITORIA: RegistroAuditoria[] = [
  { id:  1, fecha: '2026-03-05', hora: '07:12', usuario: 'Jorge Díaz',      rol: 'operario',    modulo: 'Cultivos',     accion: 'Registro creado',    descripcion: 'Deshierbe bordes Lote E1' },
  { id:  2, fecha: '2026-03-04', hora: '09:45', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Coordinación', accion: 'Registro creado',    descripcion: 'Práctica calibración equipos aspersión' },
  { id:  3, fecha: '2026-03-03', hora: '08:00', usuario: 'Luis Vargas',     rol: 'mayordomo',   modulo: 'Tractor',      accion: 'Registro creado',    descripcion: 'Adecuación Lote E3 con roto speed' },
  { id:  4, fecha: '2026-03-02', hora: '10:30', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Inventario',   accion: 'Ítem editado',       descripcion: 'Actualización stock — Dual Gold (25→19 L)' },
  { id:  5, fecha: '2026-03-02', hora: '08:15', usuario: 'Luis Vargas',     rol: 'mayordomo',   modulo: 'Combustibles', accion: 'Registro creado',    descripcion: 'Carga ACPM — Lote E3, 16 gal' },
  { id:  6, fecha: '2026-02-24', hora: '07:05', usuario: 'Jorge Díaz',      rol: 'operario',    modulo: 'Cultivos',     accion: 'Registro creado',    descripcion: 'Segunda fertilización Lote E2 — maíz' },
  { id:  7, fecha: '2026-02-21', hora: '07:00', usuario: 'Luis Vargas',     rol: 'mayordomo',   modulo: 'Cultivos',     accion: 'Registro creado',    descripcion: 'Siembra plátano Lote E1' },
  { id:  8, fecha: '2026-02-19', hora: '11:20', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Inventario',   accion: 'Ítem editado',       descripcion: 'Actualización código — DAP Granulado (INS-002)' },
  { id:  9, fecha: '2026-02-16', hora: '06:35', usuario: 'Jorge Díaz',      rol: 'operario',    modulo: 'Cultivos',     accion: 'Registro creado',    descripcion: 'Aplicación herbicida preemergente Lote E2' },
  { id: 10, fecha: '2026-02-16', hora: '06:30', usuario: 'Jorge Díaz',      rol: 'operario',    modulo: 'Combustibles', accion: 'Registro creado',    descripcion: 'Carga gasolina fumigadoras, 4.2 gal' },
  { id: 11, fecha: '2026-02-11', hora: '09:00', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Coordinación', accion: 'Registro creado',    descripcion: 'Práctica Maquinaria Agrícola — labranza' },
  { id: 12, fecha: '2026-02-11', hora: '06:30', usuario: 'Luis Vargas',     rol: 'mayordomo',   modulo: 'Tractor',      accion: 'Registro creado',    descripcion: 'Conformación surcos Lote E2' },
  { id: 13, fecha: '2026-01-31', hora: '14:00', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Coordinación', accion: 'Registro creado',    descripcion: 'Supervisión motor WEG 25HP — Semi Ingeniería' },
  { id: 14, fecha: '2026-01-26', hora: '07:00', usuario: 'Luis Vargas',     rol: 'mayordomo',   modulo: 'Tractor',      accion: 'Registro creado',    descripcion: 'Preparación Lote E2 — dos pasadas rastra' },
  { id: 15, fecha: '2026-01-10', hora: '10:00', usuario: 'Miguel González', rol: 'coordinador', modulo: 'Inventario',   accion: 'Ítem creado',        descripcion: 'Ingreso Touchdown 85 L — licitación 2026-I' },
];

export const MOCK_COMBUSTIBLE: RegistroCombustible[] = [
  { id: 1, tipo: 'ACPM',              fecha: '2026-01-26', concepto: 'Carga tractor preparación E2', actividad: 'Preparación lote E2',    vigilante: 'Pedro Ríos', lecturaCm: '42', lecturaGal: '18.5', operario: 'Luis Vargas' },
  { id: 2, tipo: 'Gasolina mezclada', fecha: '2026-02-16', concepto: 'Carga fumigadoras herbicida',   actividad: 'Aplicación herbicida E2', vigilante: 'Pedro Ríos', lecturaCm: '15', lecturaGal: '4.2',  operario: 'Jorge Díaz' },
  { id: 3, tipo: 'ACPM',              fecha: '2026-03-02', concepto: 'Carga tractor lote E3',         actividad: 'Adecuación lote E3',      vigilante: 'Ana Muñoz',  lecturaCm: '38', lecturaGal: '16.0', operario: 'Luis Vargas' },
];
