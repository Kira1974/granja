import * as XLSX from 'xlsx';

export function validateImport(rows: Record<string, unknown>[], required: string[]): string | null {
  if (rows.length === 0) return 'El archivo está vacío.';
  const cols   = Object.keys(rows[0]);
  const missing = required.filter(c => !cols.includes(c));
  if (missing.length > 0)
    return `Columnas faltantes: ${missing.join(', ')}.\n\nColumnas requeridas: ${required.join(', ')}.`;
  return null;
}

export function exportToExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Datos',
) {
  if (rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-ancho de columnas
  const keys = Object.keys(rows[0]);
  ws['!cols'] = keys.map(k => ({
    wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)) + 2,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
