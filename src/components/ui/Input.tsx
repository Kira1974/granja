interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  options?: readonly string[];
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}

export default function Input({ label, value, onChange, type = 'text', options, placeholder = '', required, readOnly }: InputProps) {
  return (
    <div className="form-group mb-0">
      <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: '#E07A5F', marginLeft: 2 }}>*</span>}
      </label>
      {readOnly ? (
        <div className="form-control" style={{ background: '#F0F2F5', color: '#3D5170', cursor: 'default' }}>{value || '—'}</div>
      ) : options ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="form-control">
          <option value="">— Seleccionar —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-control"
          required={required}
        />
      )}
    </div>
  );
}
