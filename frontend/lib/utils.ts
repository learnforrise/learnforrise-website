import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculate days remaining from now to a target date
 * Returns negative if the date has passed
 */
export function daysRemaining(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a post is "new" (published within the last 7 days)
 */
export function isNewPost(publishedAt?: string): boolean {
  if (!publishedAt) return false;
  const days = daysRemaining(publishedAt);
  // Published within last 7 days = daysRemaining returns -7 to 0
  const daysSincePublished = -days;
  return daysSincePublished >= 0 && daysSincePublished <= 7;
}

/**
 * Get the closest upcoming deadline from importantDates
 */
export function getClosestDeadline(
  dates: { label: string; date: string }[]
): { label: string; date: string; daysLeft: number } | null {
  const now = new Date();
  const upcoming = dates
    .map((d) => ({ ...d, daysLeft: daysRemaining(d.date) }))
    .filter((d) => d.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return upcoming[0] || null;
}

/**
 * Get a human-readable deadline text
 */
export function getDeadlineText(daysLeft: number): string {
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  if (daysLeft <= 7) return `${daysLeft} days left`;
  if (daysLeft <= 30) return `${Math.ceil(daysLeft / 7)} weeks left`;
  return `${Math.ceil(daysLeft / 30)} months left`;
}

/**
 * Generate a URL-safe slug category name for display
 */
export function getCategoryDisplayName(slug: string): string {
  const names: Record<string, string> = {
    'latest-jobs': 'Latest Jobs',
    result: 'Result',
    'admit-card': 'Admit Card',
    syllabus: 'Syllabus',
    'answer-key': 'Answer Key',
    admission: 'Admission',
  };
  return names[slug] || slug;
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Generate a share URL for WhatsApp
 */
export function getWhatsAppShareUrl(url: string, title: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}

/**
 * Generate a share URL for Telegram
 */
export function getTelegramShareUrl(url: string, title: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

/**
 * Generate a share URL for Facebook
 */
export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Generate a share URL for Twitter/X
 */
export function getTwitterShareUrl(url: string, title: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

/**
 * Clean and fix links in post HTML content so they do not incorrectly redirect to homepage
 */
export function cleanPostDescription(html: string): string {
  if (!html) return '';

  return html
    // Convert links pointing to plain domain without path into search links for that post title
    .replace(
      /<a\s+([^>]*?)href=["']https?:\/\/(www\.)?(learnforrise\.com|sarkariresult\.com\.cm)\/?["']([^>]*?)>(.*?)<\/a>/gi,
      (match, before, www, domain, after, text) => {
        const cleanText = text.replace(/<[^>]+>/g, '').trim();
        if (!cleanText || /^(learnforrise|sarkariresult)/i.test(cleanText)) {
          return `<a ${before}href="/"${after}>${text}</a>`;
        }
        const searchUrl = `/search?q=${encodeURIComponent(cleanText)}`;
        return `<a ${before}href="${searchUrl}"${after}>${text}</a>`;
      }
    )
    // Convert full URL links with paths into relative paths
    .replace(
      /href=["']https?:\/\/(www\.)?(sarkariresult\.com\.cm|learnforrise\.com)(\/[^"']*)["']/gi,
      'href="$3"'
    );
}

