import AdminEventItemControls from '@/components/admin/AdminEventItemControls';
import { formatEventDate } from '@/lib/format';
import { imageUrl, videoUrl } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { EventRecord } from '@/lib/types';
import VideoPlayer from './VideoPlayer';
import ZoomableImage from './ZoomableImage';

const VIDEO_FALLBACK: Record<Locale, string> = {
  bg: 'Браузърът ви не поддържа видео.',
  en: 'Your browser does not support the video tag.',
};

export default function EventPost({ event, locale }: { event: EventRecord; locale: Locale }) {
  return (
    <article className="post">
      <header className="post-head">
        <time className="post-date" dateTime={event.date}>
          {formatEventDate(event.date, locale)}
        </time>
        <h2 className="post-title">{event.title[locale]}</h2>
        <AdminEventItemControls event={event} locale={locale} />
      </header>

      {event.description[locale] ? (
        <p className="post-text">{event.description[locale]}</p>
      ) : null}
      <div className="post-media">
        {event.media.map((item) =>
          item.kind === 'image' ? (
            <ZoomableImage
              key={item.id}
              src={imageUrl(item.path)}
              alt={item.alt[locale]}
              width={item.width}
              height={item.height}
              sizes="(max-width: 900px) 100vw, 760px"
            />
          ) : (
            <VideoPlayer
              key={item.id}
              src={videoUrl(item.path)}
              poster={imageUrl(item.posterPath)}
              width={item.width}
              height={item.height}
              fallbackText={VIDEO_FALLBACK[locale]}
            />
          ),
        )}
      </div>
    </article>
  );
}
