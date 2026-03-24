import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and resolves Tailwind CSS conflicts with tailwind-merge.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.).
 * @returns A single merged class name string with Tailwind conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
