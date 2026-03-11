import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export default function Modal({ title, onClose, children, maxWidth = 580 }: ModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1050,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card modal-usco"
        style={{ width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', padding: 0, borderRadius: 12, border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
      >
        <div className="card-header d-flex justify-content-between align-items-center" style={{ borderRadius: '12px 12px 0 0' }}>
          <h5 className="mb-0" style={{ fontWeight: 700, color: '#3D5170', fontSize: 16 }}>
            {title}
          </h5>
          <button
            onClick={onClose}
            className="btn btn-light btn-sm"
            style={{ lineHeight: 1, padding: '2px 8px', fontSize: 18 }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
