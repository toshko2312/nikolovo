import { paths, type Locale } from './routes';

export const EVENTS_PER_PAGE = 10;
export const NEWS_PER_PAGE = 10;

/** Page 1 is the canonical list URL; later pages get a locale-appropriate segment. */
function pagedPath(base: string, locale: Locale, page: number): string {
  if (page <= 1) return base;
  return locale === 'bg' ? `${base}/stranitsa/${page}` : `${base}/page/${page}`;
}

export function eventsPath(locale: Locale, page: number): string {
  return pagedPath(paths.events[locale], locale, page);
}

export function newsPath(locale: Locale, page: number): string {
  return pagedPath(paths.news[locale], locale, page);
}

export function totalPages(total: number, perPage: number = EVENTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}
