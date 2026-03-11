import { BADGE_MAP, C } from '@/constants/colors';

interface BadgeProps {
  label: string;
  type?: string;
}

export default function Badge({ label, type }: BadgeProps) {
  const s = BADGE_MAP[type ?? label] ?? { bg: C.grisL, fg: C.gris };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
