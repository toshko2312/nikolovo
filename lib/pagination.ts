import { paths, type Locale } from './routes';

export const EVENTS_PER_PAGE = 10;

/** Page 1 is the canonical events URL; later pages get a locale-appropriate segment. */
export function eventsPath(locale: Locale, page: number): string {
  const base = paths.events[locale];
  if (page <= 1) return base;
  return locale === 'bg' ? `${base}/stranitsa/${page}` : `${base}/page/${page}`;
}

export function totalPages(total: number, perPage: number = EVENTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}
