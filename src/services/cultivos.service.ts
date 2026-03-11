import type { ActividadCultivo, FormCultivo } from '@/types';
import { MOCK_ACTIVIDADES_CULTIVO } from '@/constants/mockData';
// import api from './api';

let store: ActividadCultivo[] = [...MOCK_ACTIVIDADES_CULTIVO];

export const cultivosService = {
  async getAll(): Promise<ActividadCultivo[]> {
    // return api.get<ActividadCultivo[]>('/cultivos').then(r => r.data);
    return Promise.resolve([...store]);
  },

  async create(
    data: FormCultivo & { fotos: string[]; documentos: string[] },
  ): Promise<ActividadCultivo> {
    // return api.post<ActividadCultivo>('/cultivos', data).then(r => r.data);
    const nueva: ActividadCultivo = {
      id: store.length + 1,
      lote: data.lote,
      fecha: data.fecha,
      actividad: data.actividad,
      insumos: data.insumos ? data.insumos.split(',').map(s => s.trim()) : [],
      equipo: data.equipo,
      responsable: data.responsable,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      observaciones: data.observaciones,
      complementoCoord: '',
      fotos: data.fotos,
      documentos: data.documentos,
    };
    store = [nueva, ...store];
    return Promise.resolve(nueva);
  },

  async update(id: number, data: FormCultivo & { fotos: string[]; documentos: string[] }): Promise<ActividadCultivo> {
    store = store.map(i => i.id === id ? {
      ...i,
      lote: data.lote, fecha: data.fecha, actividad: data.actividad,
      insumos: data.insumos ? data.insumos.split(',').map(s => s.trim()) : [],
      equipo: data.equipo, responsable: data.responsable,
      horaInicio: data.horaInicio, horaFin: data.horaFin,
      observaciones: data.observaciones, fotos: data.fotos, documentos: data.documentos,
    } : i);
    return Promise.resolve(store.find(i => i.id === id)!);
  },

  async addComplemento(id: number, texto: string): Promise<ActividadCultivo> {
    // return api.patch<ActividadCultivo>(`/cultivos/${id}/complemento`, { complementoCoord: texto }).then(r => r.data);
    store = store.map(i => (i.id === id ? { ...i, complementoCoord: texto } : i));
    const updated = store.find(i => i.id === id)!;
    return Promise.resolve(updated);
  },
};
