import React from 'react';
import { cn } from '../utils/cn';

export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        'space-y-3',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] font-serif leading-tight">
        {title}
      </h2>
      {description ? <p className="text-gray-600 leading-relaxed">{description}</p> : null}
    </div>
  );
}

