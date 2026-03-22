import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
  const normalizedPath = path?.trim();
  if (!normalizedPath) return '';
  const directUrlMatch = normalizedPath.match(/https?:\/\/[^\s"'<>()]+/i);
  if (directUrlMatch?.[0]) return directUrlMatch[0];
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  if (/^data:/i.test(normalizedPath)) return normalizedPath;
  if (normalizedPath.startsWith('//')) return `https:${normalizedPath}`;
  if (normalizedPath.startsWith('/')) return `/api${normalizedPath}`;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    return `${apiUrl.replace(/\/+$/, '')}/${normalizedPath.replace(/^\/+/, '')}`;
  }

  return `/api/${normalizedPath.replace(/^\/+/, '')}`;
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
