/**
 * Turns a news post's link into something renderable.
 *
 * Only hosts we know how to frame get an embed — browsers give no JS signal when a
 * site refuses to be framed (X-Frame-Options / frame-ancestors), so guessing would
 * leave blank boxes with no way to fall back. Everything else renders as a link.
 */

export type EmbedTarget =
  | { kind: 'youtube'; videoId: string; params?: string }
  | {
      kind: 'iframe';
      provider: string;
      src: string;
      /** width / height; null when the provider needs a fixed pixel height instead. */
      aspect: number | null;
      height?: number;
    }
  | { kind: 'link'; href: string; label: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_PATH = /^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/;
const VIMEO_PATH = /^\/(?:video\/)?(\d+)/;
const SPOTIFY_PATH = /^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/;
const TWEET_PATH = /^\/[^/]+\/status(?:es)?\/(\d+)/;
const FACEBOOK_POST_PATH = /^\/[^/]+\/(posts|videos)\//;
const MAPS_AT_COORDS = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

/** `1h2m3s`, `90s` or a bare `90` → seconds. */
function timeToSeconds(raw: string | null): number | null {
  if (!raw) return null;

  if (/^\d+$/.test(raw)) return Number(raw);

  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match.slice(1).some(Boolean)) return null;

  const [hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0) || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function linkTarget(href: string): EmbedTarget {
  let label = href.replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (label.length > 60) label = `${label.slice(0, 59)}…`;
  return { kind: 'link', href, label };
}

function youtube(videoId: string, url: URL): EmbedTarget {
  const start = timeToSeconds(url.searchParams.get('t') ?? url.searchParams.get('start'));
  return { kind: 'youtube', videoId, ...(start ? { params: `start=${start}` } : {}) };
}

function googleMaps(url: URL): EmbedTarget | null {
  // Already an embed URL — the `pb` payload can't be rebuilt, so pass it through.
  if (url.pathname.startsWith('/maps/embed')) {
    return { kind: 'iframe', provider: 'Google Maps', src: url.toString(), aspect: 4 / 3 };
  }
  if (!url.pathname.startsWith('/maps')) return null;

  const coords = url.href.match(MAPS_AT_COORDS);
  const query = url.searchParams.get('q') ?? (coords ? `${coords[1]},${coords[2]}` : null);
  if (!query) return null;

  return {
    kind: 'iframe',
    provider: 'Google Maps',
    src: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
    aspect: 4 / 3,
  };
}

export function resolveEmbed(rawUrl: string): EmbedTarget {
  const trimmed = rawUrl.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return linkTarget(trimmed);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return linkTarget(trimmed);

  const host = url.hostname.replace(/^www\./, '');
  const href = url.toString();

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    if (YOUTUBE_ID.test(id)) return youtube(id, url);
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const watchId = url.searchParams.get('v');
    if (watchId && YOUTUBE_ID.test(watchId)) return youtube(watchId, url);

    const pathId = url.pathname.match(YOUTUBE_PATH);
    if (pathId) return youtube(pathId[1], url);
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.match(VIMEO_PATH);
    if (id) {
      return {
        kind: 'iframe',
        provider: 'Vimeo',
        src: `https://player.vimeo.com/video/${id[1]}`,
        aspect: 16 / 9,
      };
    }
  }

  if (host === 'open.spotify.com') {
    const match = url.pathname.match(SPOTIFY_PATH);
    if (match) {
      const [, type, id] = match;
      return {
        kind: 'iframe',
        provider: 'Spotify',
        src: `https://open.spotify.com/embed/${type}/${id}`,
        aspect: null,
        height: type === 'track' || type === 'episode' ? 152 : 352,
      };
    }
  }

  if (host === 'soundcloud.com') {
    return {
      kind: 'iframe',
      provider: 'SoundCloud',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&visual=false`,
      aspect: null,
      height: 166,
    };
  }

  if (host === 'google.com' || /^google\.[a-z.]+$/.test(host) || host === 'maps.google.com') {
    const maps = googleMaps(url);
    if (maps) return maps;
  }

  if (host === 'openstreetmap.org') {
    if (url.pathname.startsWith('/export/embed.html')) {
      return { kind: 'iframe', provider: 'OpenStreetMap', src: href, aspect: 4 / 3 };
    }
  }

  if (host === 'facebook.com' || host === 'fb.watch') {
    const isVideo =
      host === 'fb.watch' ||
      url.pathname.startsWith('/watch') ||
      /^\/[^/]+\/videos\//.test(url.pathname);

    if (isVideo || FACEBOOK_POST_PATH.test(url.pathname)) {
      const plugin = isVideo ? 'video' : 'post';
      return {
        kind: 'iframe',
        provider: 'Facebook',
        src: `https://www.facebook.com/plugins/${plugin}.php?href=${encodeURIComponent(href)}&show_text=true`,
        aspect: 4 / 5,
      };
    }
  }

  if (host === 'x.com' || host === 'twitter.com') {
    const tweet = url.pathname.match(TWEET_PATH);
    if (tweet) {
      return {
        kind: 'iframe',
        provider: 'X',
        src: `https://platform.twitter.com/embed/Tweet.html?id=${tweet[1]}`,
        aspect: 4 / 5,
      };
    }
  }

  return linkTarget(href);
}

/** Short provider name for the admin dialog's "this will embed as…" hint. */
export function embedProviderName(target: EmbedTarget): string | null {
  if (target.kind === 'youtube') return 'YouTube';
  if (target.kind === 'iframe') return target.provider;
  return null;
}
