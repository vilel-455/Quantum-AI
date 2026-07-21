import React from 'react';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#E53E3E] text-white hover:bg-[#E25C5C] shadow-lg shadow-[#E53E3E]/20',
  secondary:
    'bg-[#3182CE] text-white hover:bg-[#2B6CB0] shadow-lg shadow-[#3182CE]/20',
  outline:
    'border border-[#E53E3E]/50 text-[#E53E3E] hover:bg-[#E53E3E]/10',
  ghost:
    'bg-transparent text-[#E53E3E] hover:bg-[#E53E3E]/10',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type ?? 'button'}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide',
        'transition-colors duration-300 transform active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E]/30',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        // Dark mode future-proofing for outline/ghost where bg could clash.
        'dark:focus-visible:ring-white/20',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
          aria-hidden="true"
        />
      ) : null}
      <span className={cn(loading ? 'opacity-90' : undefined)}>{children}</span>
    </button>
  );
}

