interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="page-header row no-gutters py-4 px-4 mb-0">
      <div className="col">
        {subtitle && (
          <span style={{
            display: 'block',
            fontSize: '0.625rem',
            fontWeight: 500,
            color: '#818EA3',
            letterSpacing: '0.125rem',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            {subtitle}
          </span>
        )}
        <h3 className="page-title mb-0" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--usco-red)', lineHeight: 1 }}>
          {title}
        </h3>
      </div>
    </div>
  );
}
