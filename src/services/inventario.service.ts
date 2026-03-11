import type { ItemInventario, MovimientoInventario, FormInventario } from '@/types';
import { MOCK_INVENTARIO, MOCK_MOVIMIENTOS } from '@/constants/mockData';
// import api from './api';

let store: ItemInventario[] = [...MOCK_INVENTARIO];

export const inventarioService = {
  async getAll(): Promise<ItemInventario[]> {
    // return api.get<ItemInventario[]>('/inventario').then(r => r.data);
    return Promise.resolve([...store]);
  },

  async create(data: FormInventario): Promise<ItemInventario> {
    // return api.post<ItemInventario>('/inventario', data).then(r => r.data);
    const nuevo: ItemInventario = {
      id: store.length + 1,
      nombre: data.nombre,
      tipo: data.tipo,
      unidad: data.unidad,
      cantidad: Number(data.cantidad),
      estado: data.estado,
      categoria: data.categoria,
      ultimoUso: '—',
    };
    store = [...store, nuevo];
    return Promise.resolve(nuevo);
  },

  async update(id: number, partial: Partial<ItemInventario>): Promise<ItemInventario> {
    // return api.patch<ItemInventario>(`/inventario/${id}`, partial).then(r => r.data);
    store = store.map(i => (i.id === id ? { ...i, ...partial } : i));
    const updated = store.find(i => i.id === id)!;
    return Promise.resolve(updated);
  },

  async getById(id: number): Promise<ItemInventario | undefined> {
    // return api.get<ItemInventario>(`/inventario/${id}`).then(r => r.data);
    return Promise.resolve(store.find(i => i.id === id));
  },

  async getMovimientos(id: number): Promise<MovimientoInventario[]> {
    // return api.get<MovimientoInventario[]>(`/inventario/${id}/movimientos`).then(r => r.data);
    return Promise.resolve(MOCK_MOVIMIENTOS[id] ?? []);
  },
};
