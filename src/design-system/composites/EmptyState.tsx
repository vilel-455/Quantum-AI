import React from 'react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-gray-100 bg-white/80 p-10 text-center shadow-sm',
        'dark:bg-[#070B19]/70 dark:border-white/10',
        className,
      )}
    >
      {icon ? <div className="mb-4 flex items-center justify-center text-[#E53E3E]">{icon}</div> : null}
      <h3 className="text-[#1A365D] font-bold text-2xl font-serif">{title}</h3>
      {description ? <p className="mt-2 text-gray-600 leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

