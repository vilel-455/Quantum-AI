export type ClassValue = string | false | null | undefined;

/**
 * Small Tailwind-friendly className composer.
 *
 * - Accepts strings and falsy values.
 * - Keeps types strict (no `any`).
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}

