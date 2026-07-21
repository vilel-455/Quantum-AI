import React from 'react';
import { cn } from '../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full',
        'bg-[#070B19]/5 text-gray-600',
        'dark:bg-white/5 dark:text-white/70',
        sizeClasses[size],
        className,
      )}
      {...props}
      aria-label={alt}
    >
      {src ? (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <img className="h-full w-full object-cover" src={src} alt={alt} />
      ) : (
        <div className="px-1">{fallback ?? alt.slice(0, 1).toUpperCase()}</div>
      )}
    </div>
  );
}

export function AvatarFallback({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center', className)}>{children}</div>
  );
}

