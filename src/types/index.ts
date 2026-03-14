// ─── AUTH ────────────────────────────────────────────────────────────────────

export type Rol = 'coordinador' | 'mayordomo' | 'operario' | 'estudiante' | 'particular';

export interface Usuario {
  id: number;
  nombre: string;
  rol: Rol;
  email: string;
}

// ─── COORDINACIÓN ────────────────────────────────────────────────────────────

export type CategoriaCoord =
  | 'Administrativo'
  | 'Coordinación operativa'
  | 'Académico – formativo'
  | 'Técnico – infraestructura'
  | 'Gestión – enlace'
  | 'Supervisión técnica';

export interface ActividadCoord {
  id: number;
  fecha: string;
  categoria: CategoriaCoord;
  descripcion: string;
  responsable: string;
  fotos: string[];
  documentos: string[];
}

// ─── INVENTARIO ──────────────────────────────────────────────────────────────

export type TipoItem = 'insumo' | 'maquinaria' | 'herramienta';
export type EstadoItem = 'Disponible' | 'Bajo stock' | 'Operativo' | 'Mantenimiento';

export interface ItemInventario {
  id: number;
  tipo: TipoItem;
  nombre: string;
  unidad: string;
  cantidad: number;
  estado: EstadoItem;
  ultimoUso: string;
  categoria: string;
  codigo?: string;
  proveedor?: string;
  stockMinimo?: number;
  foto?: string | null;
}

export interface MovimientoInventario {
  id: number;
  fecha: string;
  accion: string;
  actividad: string;
  responsable: string;
  vigilante: string;
  cantidadMovida: number;
  stockAntes: number;
  stockDespues: number;
}

// ─── CULTIVOS ─────────────────────────────────────────────────────────────────

export interface ActividadCultivo {
  id: number;
  lote: string;
  fecha: string;
  actividad: string;
  insumos: string[];
  equipo: string;
  responsable: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
  complementoCoord: string;
  fotos: string[];
  documentos: string[];
}

// ─── TRACTOR ─────────────────────────────────────────────────────────────────

export interface RegistroTractor {
  id: number;
  fecha: string;
  actividad: string;
  horaInicio: string;
  horaFin: string;
  total: string;
  operario: string;
  observaciones: string;
  fotos: string[];
}

// ─── COMBUSTIBLE ─────────────────────────────────────────────────────────────

export type TipoCombustible = 'ACPM' | 'Gasolina mezclada';

export interface RegistroCombustible {
  id: number;
  tipo: TipoCombustible;
  fecha: string;
  concepto: string;
  actividad: string;
  vigilante: string;
  lecturaCm: string;
  lecturaGal: string;
  operario: string;
}

// ─── ADJUNTOS ─────────────────────────────────────────────────────────────────

export interface Adjunto {
  nombre: string;
  preview?: string;
}

// ─── FORMULARIOS ─────────────────────────────────────────────────────────────

export interface FormCoord {
  fecha: string;
  categoria: string;
  descripcion: string;
}

export interface FormInventario {
  nombre: string;
  tipo: TipoItem;
  unidad: string;
  cantidad: string;
  categoria: string;
  estado: EstadoItem;
}

export interface FormCultivo {
  lote: string;
  fecha: string;
  actividad: string;
  insumos: string;
  equipo: string;
  responsable: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
}

export interface FormTractor {
  fecha: string;
  actividad: string;
  horaInicio: string;
  horaFin: string;
  operario: string;
  observaciones: string;
}

export interface FormCombustible {
  tipo: TipoCombustible;
  fecha: string;
  concepto: string;
  actividad: string;
  vigilante: string;
  lecturaCm: string;
  lecturaGal: string;
  operario: string;
}
