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

const hasBlockHtmlPattern =
  /<\/?(h[1-6]|p|ul|ol|li|blockquote|pre|table|img|figure|section|article|br)\b/i;

function escapeHtml(raw: string) {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatPostContentToHtml(content: string) {
  const trimmedContent = content.trim();
  if (!trimmedContent) return '';
  if (hasBlockHtmlPattern.test(trimmedContent)) return trimmedContent;

  return trimmedContent
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('');
}
