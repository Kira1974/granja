import type { RegistroTractor, FormTractor } from '@/types';
import { MOCK_TRACTOR } from '@/constants/mockData';
// import api from './api';

let store: RegistroTractor[] = [...MOCK_TRACTOR];

function calcTotal(ini: string, fin: string): string {
  if (!ini || !fin) return '—';
  const [h1, m1] = ini.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  const diff = h2 * 60 + m2 - (h1 * 60 + m1);
  return diff > 0 ? `${(diff / 60).toFixed(1)}h` : '—';
}

export const tractorService = {
  async getAll(): Promise<RegistroTractor[]> {
    // return api.get<RegistroTractor[]>('/tractor').then(r => r.data);
    return Promise.resolve([...store]);
  },

  async create(data: FormTractor & { fotos: string[] }): Promise<RegistroTractor> {
    // return api.post<RegistroTractor>('/tractor', data).then(r => r.data);
    const nuevo: RegistroTractor = {
      id: store.length + 1,
      fecha: data.fecha,
      actividad: data.actividad,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      total: calcTotal(data.horaInicio, data.horaFin),
      operario: data.operario,
      observaciones: data.observaciones,
      fotos: data.fotos,
    };
    store = [nuevo, ...store];
    return Promise.resolve(nuevo);
  },

  async update(id: number, data: FormTractor & { fotos: string[] }): Promise<RegistroTractor> {
    store = store.map(i => i.id === id ? {
      ...i, ...data,
      total: calcTotal(data.horaInicio, data.horaFin),
      fotos: data.fotos,
    } : i);
    return Promise.resolve(store.find(i => i.id === id)!);
  },

  calcTotal,
};
