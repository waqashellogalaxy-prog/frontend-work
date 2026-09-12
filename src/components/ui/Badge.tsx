import type { ReactNode } from 'react';

type BadgeColor = 'gray' | 'green' | 'yellow' | 'red' | 'blue';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
}

const colorClasses: Record<BadgeColor, string> = {
  gray: 'bg-slate-100 text-slate-700',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
};

export function Badge({ color = 'gray', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}
