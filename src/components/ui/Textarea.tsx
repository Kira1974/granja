interface TextareaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function Textarea({ label, value, onChange, placeholder = '', rows = 3 }: TextareaProps) {
  return (
    <div className="form-group mb-0">
      <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#818EA3', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 4 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="form-control"
        style={{ resize: 'vertical' }}
      />
    </div>
  );
}
