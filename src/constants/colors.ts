export const C = {
  verde:      '#2D6A4F',
  verdeMid:   '#40916C',
  verdeLight: '#74C69D',
  crema:      '#F8F4ED',
  tierra:     '#8B5E3C',
  tierraL:    '#C9956C',
  oscuro:     '#1C2321',
  gris:       '#4A5568',
  grisL:      '#E8E4DC',
  blanco:     '#FDFCF8',
  alerta:     '#E07A5F',
  info:       '#3D9BE9',
} as const;

export type ColorKey = keyof typeof C;

// Paleta USCO: rojo, dorado, gris, negro — sin colores estridentes
export const BADGE_MAP: Record<string, { bg: string; fg: string }> = {
  // Estados inventario
  Disponible:    { bg: '#E8F5E9', fg: '#2D6A4F' },
  'Bajo stock':  { bg: '#FDF3DC', fg: '#8B6914' },
  Operativo:     { bg: '#E8F5E9', fg: '#2D6A4F' },
  Mantenimiento: { bg: '#F5E8E8', fg: '#6B0F0F' },
  // Tipos inventario
  insumo:        { bg: '#F0EDE8', fg: '#5A4A3A' },
  maquinaria:    { bg: '#EEE8E0', fg: '#4A3828' },
  herramienta:   { bg: '#F5F0E8', fg: '#6B5A3A' },
  // Roles
  coordinador:   { bg: '#F5E8E8', fg: '#6B0F0F' },
  mayordomo:     { bg: '#EDE8E0', fg: '#3D3020' },
  operario:      { bg: '#F0EDE8', fg: '#4A3A2A' },
  estudiante:    { bg: '#FDF8EC', fg: '#7A6020' },
  // Categorías coordinación
  'Administrativo':            { bg: '#F5E8E8', fg: '#6B0F0F' },
  'Coordinación operativa':    { bg: '#EDE8E0', fg: '#3D3020' },
  'Académico – formativo':     { bg: '#FDF8EC', fg: '#7A6020' },
  'Técnico – infraestructura': { bg: '#F0EDE8', fg: '#4A3A2A' },
  'Gestión – enlace':          { bg: '#EEE8E0', fg: '#3D2A1A' },
  'Supervisión técnica':       { bg: '#F5F0E8', fg: '#5A4020' },
};
