import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const USCO_RED   = [139, 26, 26]  as [number, number, number];
const USCO_DARK  = [107, 15, 15]  as [number, number, number];
const USCO_GOLD  = [200, 168, 75] as [number, number, number];
const HEADER_BG  = [251, 245, 230] as [number, number, number];
const GRAY_TEXT  = [90, 97, 105]  as [number, number, number];

export function exportToPDF(
  rows: Record<string, unknown>[],
  filename: string,
  title: string,
  subtitle = '',
) {
  if (rows.length === 0) return;

  const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const cols = Object.keys(rows[0]);
  const W    = doc.internal.pageSize.getWidth();
  const now  = new Date();
  const fecha = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const hora  = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // ── Encabezado ─────────────────────────────────────────────────────────────
  // Barra roja superior
  doc.setFillColor(...USCO_DARK);
  doc.rect(0, 0, W, 18, 'F');

  // Nombre institución
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GRANJA EXPERIMENTAL', 14, 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Universidad Surcolombiana — USCO', 14, 13.5);

  // Fecha a la derecha
  doc.setFontSize(8);
  doc.text(`Generado: ${fecha}  ${hora}`, W - 14, 10, { align: 'right' });

  // Línea dorada bajo la barra roja
  doc.setDrawColor(...USCO_GOLD);
  doc.setLineWidth(0.8);
  doc.line(0, 18, W, 18);

  // ── Título del módulo ──────────────────────────────────────────────────────
  doc.setTextColor(...USCO_RED);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 28);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    doc.text(subtitle, 14, 34);
  }

  // Contador de registros
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`${rows.length} registro${rows.length !== 1 ? 's' : ''}`, W - 14, 28, { align: 'right' });

  // ── Tabla ──────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: subtitle ? 38 : 32,
    head: [cols],
    body: rows.map(r => cols.map(c => String(r[c] ?? '—'))),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: GRAY_TEXT,
      lineColor: [228, 232, 239],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: HEADER_BG,
      textColor: [122, 96, 32],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: Object.fromEntries(
      cols.map((_, i) => [i, { cellWidth: 'auto' }])
    ),
    didDrawPage: (data) => {
      // Footer por página
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageNum   = data.pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(...GRAY_TEXT);
      doc.text(
        `Granja Experimental USCO  ·  ${title}  ·  Página ${pageNum} de ${pageCount}`,
        W / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' },
      );
      // Línea dorada en footer
      doc.setDrawColor(...USCO_GOLD);
      doc.setLineWidth(0.4);
      doc.line(14, doc.internal.pageSize.getHeight() - 9, W - 14, doc.internal.pageSize.getHeight() - 9);
    },
  });

  doc.save(`${filename}.pdf`);
}
