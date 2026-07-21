import React from 'react';
import { cn } from '../utils/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingYClasses: Record<NonNullable<PageContainerProps['paddingY']>, string> = {
  none: '',
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-16',
  xl: 'py-24',
};

export function PageContainer({
  className,
  paddingY = 'xl',
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-6 lg:px-12',
        paddingYClasses[paddingY],
        className,
      )}
      {...props}
    />
  );
}

