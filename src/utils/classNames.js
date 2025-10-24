// 🔧 Utility function for className merging
// Following DRY principle - avoid code duplication

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const classNames = cn;