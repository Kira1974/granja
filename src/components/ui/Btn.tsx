import { type MouseEvent } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  small?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const CLASS_MAP: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-outline-success',
  danger:    'btn-danger',
  ghost:     'btn-outline-secondary',
};

export default function Btn({ children, onClick, variant = 'primary', small = false, disabled = false, type = 'button' }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${CLASS_MAP[variant]}${small ? ' btn-sm' : ''}`}
    >
      {children}
    </button>
  );
}
