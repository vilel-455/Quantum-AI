import React from 'react';
import { cn } from '../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({
  className,
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        'bg-gray-200',
        'dark:bg-white/10',
        className,
      )}
      {...props}
    />
  );
}

