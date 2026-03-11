interface PaginationProps {
  total: number;
  page: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, page, pageSize = 20, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="d-flex align-items-center justify-content-between mt-3 px-1" style={{ fontSize: 13, color: '#818EA3' }}>
      <span>Mostrando {from}–{to} de {total} registros</span>
      <div className="d-flex align-items-center" style={{ gap: 6 }}>
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ borderRadius: 20, padding: '2px 10px' }}
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
          <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle' }}>chevron_left</i>
        </button>
        <span style={{ padding: '0 8px', fontWeight: 600, color: '#3D5170' }}>{page} / {totalPages}</span>
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ borderRadius: 20, padding: '2px 10px' }}
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
        >
          <i className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle' }}>chevron_right</i>
        </button>
      </div>
    </div>
  );
}
