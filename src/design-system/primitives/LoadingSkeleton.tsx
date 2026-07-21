import React from 'react';
import { cn } from '../utils/cn';

export type LoadingSkeletonVariant =
  | 'text'
  | 'rect'
  | 'avatar'
  | 'card';

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant;
  className?: string;
  /** Used only when variant is 'text' */
  lines?: number;
}

export function LoadingSkeleton({
  variant = 'rect',
  className,
  lines = 3,
}: LoadingSkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className={cn(
              'h-3 rounded bg-gray-200',
              'dark:bg-white/10',
              'animate-pulse',
              idx === 0 ? 'w-2/3' : idx === 1 ? 'w-5/6' : 'w-3/4',
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={cn(
          'h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse',
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm',
          'dark:bg-[#070B19]/70 dark:border-white/10',
          'animate-pulse',
          className,
        )}
        aria-hidden="true"
      >
        <div className="space-y-4">
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-4 w-full rounded bg-gray-200 dark:bg-white/10 animate-pulse',
        className,
      )}
      aria-hidden="true"
    />
  );
}

