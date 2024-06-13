import { type ClassValue, clsx } from 'clsx/lite';

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
