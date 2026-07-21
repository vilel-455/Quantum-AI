import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Keep branding and current visual language: subtle border + soft bg.
        'rounded-xl border border-gray-100 bg-white/80 shadow-sm',
        'backdrop-blur-sm',
        // Dark mode future-proofing.
        'dark:bg-[#070B19]/70 dark:border-white/10',
        className,
      )}
      {...props}
    />
  );
}

