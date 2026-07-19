import Link from 'next/link';
import { eventsPath } from '@/lib/pagination';
import type { Locale } from '@/lib/routes';

const COPY = {
  bg: { prev: '← Предишна', next: 'Следваща →', nav: 'Странициране' },
  en: { prev: '← Previous', next: 'Next →', nav: 'Pagination' },
} satisfies Record<Locale, Record<string, string>>;

export default function Pagination({
  locale,
  page,
  totalPages,
}: {
  locale: Locale;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const t = COPY[locale];

  return (
    <nav className="pagination" aria-label={t.nav}>
      {page > 1 ? (
        <Link className="field field-button pagination-edge" href={eventsPath(locale, page - 1)}>
          {t.prev}
        </Link>
      ) : (
        <span className="field field-button pagination-edge pagination-disabled" aria-hidden="true">
          {t.prev}
        </span>
      )}

      <div className="pagination-numbers">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <Link
            key={num}
            href={eventsPath(locale, num)}
            className={num === page ? 'pagination-num pagination-num-current' : 'pagination-num'}
            aria-current={num === page ? 'page' : undefined}
          >
            {num}
          </Link>
        ))}
      </div>

      {page < totalPages ? (
        <Link className="field field-button pagination-edge" href={eventsPath(locale, page + 1)}>
          {t.next}
        </Link>
      ) : (
        <span className="field field-button pagination-edge pagination-disabled" aria-hidden="true">
          {t.next}
        </span>
      )}
    </nav>
  );
}
