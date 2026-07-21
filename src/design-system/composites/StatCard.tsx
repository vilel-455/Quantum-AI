import React from 'react';
import { cn } from '../utils/cn';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-sm',
        'dark:bg-[#070B19]/70 dark:border-white/10',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-gray-600 text-sm font-semibold tracking-wide">{label}</p>
          <div className="mt-2 flex items-baseline gap-3">
            {loading ? (
              <div className="h-8 w-28 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-[#1A365D] leading-none">{value}</p>
            )}
          </div>
          {subtext ? (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{subtext}</p>
          ) : null}
        </div>
        {icon ? <div className="text-[#E53E3E]">{icon}</div> : null}
      </div>
    </div>
  );
}

