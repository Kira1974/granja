import { useRef } from 'react';
import { parseExcel, validateImport } from '@/utils/excel';

function ExcelIcon({ solid = true }: { solid?: boolean }) {
  const bg = solid ? 'rgba(255,255,255,0.22)' : '#1D6F42';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
      <rect width="15" height="15" rx="2" fill={bg} />
      <text x="2" y="11.5" fontFamily="Arial" fontWeight="bold" fontSize="9.5" fill="white">X</text>
    </svg>
  );
}

function PdfIcon({ outline = false }: { outline?: boolean }) {
  const color = outline ? '#C0392B' : 'rgba(255,255,255,0.9)';
  const bg    = outline ? 'rgba(192,57,43,0.12)' : 'rgba(255,255,255,0.22)';
  const fold  = outline ? 'rgba(192,57,43,0.25)' : 'rgba(0,0,0,0.15)';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 1.5 C2 1 2.5 0.5 3 0.5 H9.5 L13 4 V13.5 C13 14 12.5 14.5 12 14.5 H3 C2.5 14.5 2 14 2 13.5 Z" fill={bg} />
      <path d="M9.5 0.5 L13 4 H9.5 Z" fill={fold} />
      <text x="3" y="11" fontFamily="Arial" fontWeight="bold" fontSize="5.5" fill={color} letterSpacing="0.3">PDF</text>
    </svg>
  );
}

interface ExcelButtonsProps {
  onExport:    () => void;
  onImport:    (rows: Record<string, unknown>[]) => void;
  onExportPDF: () => void;
  requiredCols: string[];
  canExport?:  boolean;
  canImport?:  boolean;
}

export default function ExcelButtons({ onExport, onImport, onExportPDF, requiredCols, canExport = true, canImport = true }: ExcelButtonsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows  = await parseExcel(file);
      const error = validateImport(rows, requiredCols);
      if (error) { alert(error); return; }
      onImport(rows);
    } catch {
      alert('Error al leer el archivo. Verifica que sea un Excel válido (.xlsx).');
    }
    e.target.value = '';
  };

  const btnBase = 'btn btn-sm d-inline-flex align-items-center';
  const gap     = { gap: 5 } as React.CSSProperties;

  if (!canExport && !canImport) return null;

  return (
    <div className="d-flex" style={{ gap: 6 }}>

      {/* Exportar Excel */}
      {canExport && <button
        className={btnBase}
        style={{ ...gap, background: '#1D6F42', borderColor: '#1D6F42', color: '#fff', borderRadius: 20 }}
        onClick={onExport}
        title="Exportar a Excel"
      >
        <ExcelIcon solid />
        Exportar
      </button>}

      {/* Importar Excel */}
      {canImport && <button
        className={btnBase}
        style={{ ...gap, background: 'transparent', borderColor: '#1D6F42', color: '#1D6F42', borderRadius: 20 }}
        onClick={() => inputRef.current?.click()}
        title="Importar desde Excel"
      >
        <ExcelIcon solid={false} />
        Importar
      </button>}

      {/* Descargar PDF */}
      {canExport && <button
        className={btnBase}
        style={{ ...gap, background: 'transparent', borderColor: '#C0392B', color: '#C0392B', borderRadius: 20 }}
        onClick={onExportPDF}
        title="Descargar PDF"
      >
        <PdfIcon outline />
        Descargar
      </button>}

      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}
