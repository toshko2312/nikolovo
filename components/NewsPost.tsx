import AdminNewsItemControls from '@/components/admin/AdminNewsItemControls';
import NewsEmbed from '@/components/NewsEmbed';
import { formatEventDate } from '@/lib/format';
import type { Locale } from '@/lib/routes';
import type { NewsRecord } from '@/lib/types';

/** One news item — title, optional description, optional embedded or linked URL. */
export default function NewsPost({ item, locale }: { item: NewsRecord; locale: Locale }) {
  return (
    <article className="post">
      <header className="post-head">
        <time className="post-date" dateTime={item.date}>
          {formatEventDate(item.date, locale)}
        </time>
        <h2 className="post-title">{item.title[locale]}</h2>
        <AdminNewsItemControls item={item} locale={locale} />
      </header>

      {item.description[locale] ? <p className="post-text">{item.description[locale]}</p> : null}

      {item.link ? <NewsEmbed url={item.link} title={item.title[locale]} locale={locale} /> : null}
    </article>
  );
}
