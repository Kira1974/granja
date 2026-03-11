import type { ActividadCoord, FormCoord } from '@/types';
import { MOCK_ACTIVIDADES_COORD } from '@/constants/mockData';
// import api from './api'; // Descomentar cuando el backend esté listo

let store: ActividadCoord[] = [...MOCK_ACTIVIDADES_COORD];

export const coordinacionService = {
  async getAll(): Promise<ActividadCoord[]> {
    // return api.get<ActividadCoord[]>('/coordinacion').then(r => r.data);
    return Promise.resolve([...store]);
  },

  async create(data: FormCoord & { responsable: string; fotos: string[]; documentos: string[] }): Promise<ActividadCoord> {
    // return api.post<ActividadCoord>('/coordinacion', data).then(r => r.data);
    const nueva: ActividadCoord = {
      id: store.length + 1,
      fecha: data.fecha,
      categoria: data.categoria as ActividadCoord['categoria'],
      descripcion: data.descripcion,
      responsable: data.responsable,
      fotos: data.fotos,
      documentos: data.documentos,
    };
    store = [nueva, ...store];
    return Promise.resolve(nueva);
  },

  async update(id: number, data: FormCoord & { responsable: string; fotos: string[]; documentos: string[] }): Promise<ActividadCoord> {
    store = store.map(i => i.id === id ? { ...i, ...data, categoria: data.categoria as ActividadCoord['categoria'] } : i);
    return Promise.resolve(store.find(i => i.id === id)!);
  },
};
