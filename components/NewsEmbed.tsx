import { YouTubeEmbed } from '@next/third-parties/google';
import { resolveEmbed } from '@/lib/embed';
import type { Locale } from '@/lib/routes';

const OPEN_LINK: Record<Locale, string> = { bg: 'Отвори връзката', en: 'Open the link' };

/**
 * Renders a news post's link. YouTube gets the lite facade from @next/third-parties
 * (no player JS until the visitor clicks); other known providers get an iframe with a
 * plain link underneath, in case they refuse to be framed. Everything else is a link.
 */
export default function NewsEmbed({
  url,
  title,
  locale,
}: {
  url: string;
  title: string;
  locale: Locale;
}) {
  const target = resolveEmbed(url);

  if (target.kind === 'youtube') {
    return (
      <div className="post-embed">
        <YouTubeEmbed
          videoid={target.videoId}
          params={target.params}
          playlabel={title}
          width={760}
          height={428}
          style="max-width:100%"
        />
      </div>
    );
  }

  if (target.kind === 'iframe') {
    return (
      <div className="post-embed">
        <div
          className="embed-frame"
          style={target.aspect ? { aspectRatio: String(target.aspect) } : undefined}
        >
          <iframe
            src={target.src}
            title={`${title} — ${target.provider}`}
            height={target.height}
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          />
        </div>
        <a className="post-link" href={url} target="_blank" rel="noopener noreferrer">
          {OPEN_LINK[locale]} ↗
        </a>
      </div>
    );
  }

  return (
    <p className="post-embed">
      <a className="post-link" href={target.href} target="_blank" rel="noopener noreferrer">
        {target.label} ↗
      </a>
    </p>
  );
}
