import { useState } from 'react';
import { C } from '@/constants/colors';
import { MOCK_USUARIOS } from '@/constants/mockData';
import type { Usuario, Rol } from '@/types';
import { Badge, Btn, Modal, Input, ExcelButtons } from '@/components/ui';
import Header from '@/components/layout/Header';
import { exportToExcel } from '@/utils/excel';
import { exportToPDF }   from '@/utils/pdf';

const ROLES: Rol[] = ['coordinador', 'mayordomo', 'operario', 'estudiante'];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [editModal, setEditModal] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', rol: '' });

  const abrirEditar = (u: Usuario) => {
    setEditModal(u);
    setForm({ nombre: u.nombre, email: u.email, rol: u.rol });
  };

  const guardar = () => {
    if (!editModal) return;
    setUsuarios(p => p.map(u => u.id === editModal.id ? { ...u, nombre: form.nombre, email: form.email, rol: form.rol as Rol } : u));
    setEditModal(null);
  };

  const handleExport = () => {
    exportToExcel(
      usuarios.map(u => ({ 'Nombre': u.nombre, 'Correo': u.email, 'Rol': u.rol })),
      'usuarios',
      'Usuarios',
    );
  };

  const handleExportPDF = () => exportToPDF(
    usuarios.map(u => ({ 'Nombre': u.nombre, 'Correo': u.email, 'Rol': u.rol })),
    'usuarios', 'Gestión de Usuarios', 'Roles y niveles de acceso al sistema',
  );

  const handleImport = (rows: Record<string, unknown>[]) => {
    rows.forEach(row => {
      const u: Usuario = {
        id:     Date.now() + Math.random(),
        nombre: String(row['Nombre'] ?? ''),
        email:  String(row['Correo'] ?? ''),
        rol:    (String(row['Rol']   ?? 'operario')) as Rol,
      };
      setUsuarios(p => [...p, u]);
    });
  };

  const desactivar = (id: number) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    setUsuarios(p => p.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="main-content-container container-fluid py-4">
      <Header title="Gestión de Usuarios" subtitle="Roles y niveles de acceso al sistema" />

        <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
          <ExcelButtons onExport={handleExport} onImport={handleImport} onExportPDF={handleExportPDF} requiredCols={['Nombre','Rol']} />
          <Btn onClick={() => {
            setEditModal({ id: 0, nombre: '', rol: 'operario', email: '' });
            setForm({ nombre: '', email: '', rol: 'operario' });
          }}>
            + Nuevo usuario
          </Btn>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table mb-0">
            <thead className="thead-light">
              <tr>
                {['Nombre', 'Correo', 'Rol', 'Acciones'].map(h => (
                  <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: '#3D5170' }}>{u.nombre}</td>
                  <td style={{ color: C.gris }}>{u.email}</td>
                  <td><Badge label={u.rol} /></td>
                  <td>
                    <div className="d-flex" style={{ gap: 8 }}>
                      <Btn small variant="ghost" onClick={() => abrirEditar(u)}>Editar</Btn>
                      <Btn small variant="danger" onClick={() => desactivar(u.id)}>Desactivar</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModal !== null && (
        <Modal
          title={editModal.id === 0 ? 'Nuevo usuario' : `Editar — ${editModal.nombre}`}
          onClose={() => setEditModal(null)}
        >
          <div className="d-flex flex-column" style={{ gap: 13 }}>
            <Input label="Nombre completo" value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} placeholder="Ej: Carlos Ramos" required />
            <Input label="Correo institucional" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="usuario@usco.edu.co" />
            <Input label="Rol" value={form.rol} onChange={v => setForm(p => ({ ...p, rol: v }))} options={ROLES} />
            <div className="d-flex justify-content-end" style={{ gap: 10 }}>
              <Btn variant="ghost" onClick={() => setEditModal(null)}>Cancelar</Btn>
              <Btn onClick={guardar} disabled={!form.nombre}>
                {editModal.id === 0 ? 'Crear usuario' : 'Guardar cambios'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
