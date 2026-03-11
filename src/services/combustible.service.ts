import type { RegistroCombustible, FormCombustible } from '@/types';
import { MOCK_COMBUSTIBLE } from '@/constants/mockData';
// import api from './api';

let store: RegistroCombustible[] = [...MOCK_COMBUSTIBLE];

export const combustibleService = {
  async getAll(): Promise<RegistroCombustible[]> {
    // return api.get<RegistroCombustible[]>('/combustible').then(r => r.data);
    return Promise.resolve([...store]);
  },

  async create(data: FormCombustible): Promise<RegistroCombustible> {
    // return api.post<RegistroCombustible>('/combustible', data).then(r => r.data);
    const nuevo: RegistroCombustible = { id: store.length + 1, ...data };
    store = [nuevo, ...store];
    return Promise.resolve(nuevo);
  },

  async update(id: number, data: FormCombustible): Promise<RegistroCombustible> {
    store = store.map(i => i.id === id ? { ...i, ...data } : i);
    return Promise.resolve(store.find(i => i.id === id)!);
  },
};
