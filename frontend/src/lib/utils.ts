import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${API_URL}${path}`;
}
