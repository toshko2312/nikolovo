import type { Locale } from './routes';

const BG_MONTHS = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
];

const enFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "24 май 2026" / "24 May 2026" — matches the dates in the original static pages. */
export function formatEventDate(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (locale === 'en') return enFormatter.format(date);
  return `${date.getUTCDate()} ${BG_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
