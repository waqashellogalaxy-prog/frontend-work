import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
