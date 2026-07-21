import React from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#E53E3E]/10 text-[#E53E3E] border-[#E53E3E]/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-600 border-red-500/20',
  info: 'bg-[#3182CE]/10 text-[#3182CE] border-[#3182CE]/20',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        'tracking-wide',
        'dark:bg-white/5 dark:border-white/10',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

