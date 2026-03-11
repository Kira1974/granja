import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { inventarioService } from '@/services/inventario.service';
import { C } from '@/constants/colors';
import { TIPOS_ITEM, ESTADOS_ITEM } from '@/constants/catalogos';
import type { ItemInventario, FormInventario, TipoItem, EstadoItem } from '@/types';
import { Badge, Btn, Modal, Input, ExcelButtons, Pagination } from '@/components/ui';
import { puedeImportar, puedeExportar, puedeEditarInventario } from '@/constants/permisos';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const FORM_INIT: FormInventario = { nombre: '', tipo: 'insumo', unidad: '', cantidad: '', categoria: '', estado: 'Disponible' };

export default function InventarioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems]   = useState<ItemInventario[]>([]);
  const [filtro, setFiltro] = useState<string>('todos');
  const [buscar, setBuscar] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState<FormInventario>(FORM_INIT);
  const [saving, setSaving] = useState(false);
  const [page, setPage]     = useState(1);

  useEffect(() => { inventarioService.getAll().then(setItems); }, []);

  const setField = (k: keyof FormInventario) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleExport = () => {
    exportToExcel(
      filtered.map(i => ({ 'Nombre': i.nombre, 'Tipo': i.tipo, 'Categoría': i.categoria, 'Unidad': i.unidad, 'Cantidad': i.tipo === 'maquinaria' ? '—' : i.cantidad, 'Estado': i.estado, 'Código': i.codigo ?? '', 'Proveedor': i.proveedor ?? '', 'Stock mínimo': i.stockMinimo ?? '', 'Último uso': i.ultimoUso })),
      'inventario',
      'Inventario',
    );
  };

  const handleExportPDF = () => exportToPDF(
    filtered.map(i => ({ 'Nombre': i.nombre, 'Tipo': i.tipo, 'Categoría': i.categoria, 'Unidad': i.unidad, 'Cantidad': i.tipo === 'maquinaria' ? '—' : i.cantidad, 'Estado': i.estado, 'Código': i.codigo ?? '', 'Proveedor': i.proveedor ?? '' })),
    'inventario', 'Inventario', 'Insumos agrícolas, maquinaria y herramientas',
  );

  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const nuevo = await inventarioService.create({
        nombre:    String(row['Nombre']    ?? ''),
        tipo:      (String(row['Tipo']     ?? 'insumo')) as TipoItem,
        unidad:    String(row['Unidad']    ?? ''),
        cantidad:  String(row['Cantidad']  ?? '0'),
        categoria: String(row['Categoría'] ?? ''),
        estado:    (String(row['Estado']   ?? 'Disponible')) as EstadoItem,
      });
      setItems(p => [...p, nuevo]);
    }
  };

  const filtered = items.filter(i =>
    (filtro === 'todos' || i.tipo === filtro) &&
    i.nombre.toLowerCase().includes(buscar.toLowerCase()),
  );

  const handleClose = () => { setModal(false); setForm(FORM_INIT); };

  const guardar = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const nuevo = await inventarioService.create(form);
    setItems(p => [...p, nuevo]);
    setSaving(false);
    handleClose();
  };

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
      <Header title="Inventario" subtitle="Insumos agrícolas, maquinaria y herramientas" />

        {/* Filtros */}
        <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 8 }}>
          {(['todos', ...TIPOS_ITEM] as const).map(t => (
            <button
              key={t}
              onClick={() => { setFiltro(t); setPage(1); }}
              className={`btn btn-sm ${filtro === t ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ borderRadius: 20 }}
            >
              {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar..."
            className="form-control form-control-sm ml-auto"
            style={{ maxWidth: 200 }}
          />
          <div className="d-flex" style={{ gap: 8 }}>
            <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Nombre','Tipo','Unidad','Cantidad']} canExport={puedeExportar(user?.rol)} canImport={puedeImportar(user?.rol)} />
            {puedeEditarInventario(user?.rol) && <Btn onClick={() => setModal(true)}>+ Agregar</Btn>}
          </div>
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Nombre', 'Tipo', 'Categoría', 'Unidad', 'Cantidad', 'Estado', 'Último uso', ''].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * 20, page * 20).map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600, color: '#3D5170' }}>{i.nombre}</td>
                  <td><Badge label={i.tipo} /></td>
                  <td style={{ color: C.gris }}>{i.categoria}</td>
                  <td style={{ color: C.gris }}>{i.unidad}</td>
                  <td style={{ fontWeight: 700 }}>{i.tipo === 'maquinaria' ? '—' : i.cantidad}</td>
                  <td><Badge label={i.estado} /></td>
                  <td style={{ color: C.gris, fontSize: 12 }}>{i.ultimoUso}</td>
                  <td>
                    <Btn small variant="ghost" onClick={() => navigate(`/inventario/${i.id}`)}>Ver hoja</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onChange={setPage} />
      </div>

      {/* Modal crear */}
      {modal && (
        <Modal title="Agregar ítem al inventario" onClose={handleClose}>
          <div className="d-flex flex-column" style={{ gap: 13 }}>
            <Input label="Nombre" value={form.nombre} onChange={setField('nombre')} placeholder="Ej: Mancozeb" required />
            <div className="row">
              <div className="col-6"><Input label="Tipo" value={form.tipo} onChange={v => setForm(p => ({ ...p, tipo: v as TipoItem }))} options={[...TIPOS_ITEM]} /></div>
              <div className="col-6"><Input label="Categoría" value={form.categoria} onChange={setField('categoria')} placeholder="Ej: Fungicida" /></div>
            </div>
            <div className="row">
              <div className="col-6"><Input label="Unidad" value={form.unidad} onChange={setField('unidad')} placeholder="Litros / Kilos / Unidad" /></div>
              <div className="col-6"><Input label="Cantidad" value={form.cantidad} onChange={setField('cantidad')} type="number" /></div>
            </div>
            <Input label="Estado" value={form.estado} onChange={v => setForm(p => ({ ...p, estado: v as EstadoItem }))} options={[...ESTADOS_ITEM]} />
            <div className="d-flex justify-content-end" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={saving || !form.nombre}>{saving ? 'Guardando…' : 'Guardar'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
