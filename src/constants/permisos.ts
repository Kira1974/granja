import type { Rol } from '@/types';

export const puedeCrear            = (rol?: Rol) => rol !== 'estudiante';
export const puedeImportar         = (rol?: Rol) => rol === 'coordinador';
export const puedeExportar         = (rol?: Rol) => rol !== 'estudiante';
export const puedeEditarInventario = (rol?: Rol) => rol === 'coordinador';
