import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges Tailwind classes intelligently (handles conflicts)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats dates nicely (e.g., "October 20, 2025")
export function formatDate(dateString: string | number | Date) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}