import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function Card({ children, style, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`} style={{ padding: '1.25rem 1.5rem', ...style }}>
      {children}
    </div>
  );
}
