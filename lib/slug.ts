/** Official Bulgarian transliteration (Streamlined System), lowercase only. */
const CYRILLIC: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
};

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC[char] ?? char)
    .join('');
}

/**
 * URL-safe slug from a title, suffixed with the event date so two events sharing
 * a title (e.g. an annual celebration) never collide.
 */
export function slugify(title: string, isoDate?: string): string {
  const base = transliterate(title)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

  const stem = base || 'event';
  return isoDate ? `${stem}-${isoDate}` : stem;
}
