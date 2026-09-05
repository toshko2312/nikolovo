/** A file the browser cannot decode would otherwise leave the form spinning forever. */
const METADATA_TIMEOUT_MS = 20000;

/** Stills are capped to a 720p box; the site never renders an image wider than ~760 CSS px. */
export const MAX_IMAGE_WIDTH = 1280;
export const MAX_IMAGE_HEIGHT = 720;

const IMAGE_QUALITY = 0.82;

function withTimeout<T>(work: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), METADATA_TIMEOUT_MS),
    ),
  ]);
}

/** Never above 1, so a source already smaller than the box is left at its own size. */
function fitScale(width: number, height: number): number {
  return Math.min(1, MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
}

/** prepareUploads derives the storage extension from this name, so it has to say .webp. */
function webpName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return `${dot > 0 ? filename.slice(0, dot) : filename}.webp`;
}

/** Draws a source scaled to fit the 720p box. Shared by stills and video posters. */
function drawScaled(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const scale = fitScale(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  // Large downscale factors alias badly at the default quality.
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** The resized bytes to upload, plus the dimensions and name that describe them. */
export type PreparedImage = { blob: Blob; width: number; height: number; filename: string };

export type VideoMeta = {
  width: number;
  height: number;
  durationSeconds: number;
  /** Shown by the <video> element before playback. */
  poster: Blob;
  /** jpg twin of the poster — schema.org thumbnailUrl, which crawlers prefer as jpg. */
  thumbnail: Blob;
};

/**
 * Downscales a picked image into the 720p box and re-encodes it as webp, so the bucket
 * never holds the multi-megabyte original. The canvas round-trip also drops the EXIF,
 * GPS coordinates included.
 */
export function prepareImage(file: File): Promise<PreparedImage> {
  return withTimeout(readImage(file), `Timed out reading image ${file.name}`);
}

async function readImage(file: File): Promise<PreparedImage> {
  const image = await decodeImage(file);
  const canvas = drawScaled(image, image.naturalWidth, image.naturalHeight);
  const blob = await toBlob(canvas, 'image/webp', IMAGE_QUALITY);

  return { blob, width: canvas.width, height: canvas.height, filename: webpName(file.name) };
}

function decodeImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image ${file.name}`));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Could not encode ${type}`))),
      type,
      quality,
    );
  });
}

/**
 * Reads dimensions and duration, and grabs a frame to use as the poster. The schema's
 * event_media_video_has_poster check requires both a poster and a duration, so a video
 * cannot be stored without them.
 */
export function videoMeta(file: File): Promise<VideoMeta> {
  return withTimeout(
    readVideo(file),
    `Timed out reading video ${file.name} — the browser could not decode it`,
  );
}

function readVideo(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fail = (message: string) => {
      URL.revokeObjectURL(url);
      reject(new Error(message));
    };

    video.onloadedmetadata = () => {
      // A frame at the very start is often black; sample slightly in when possible.
      video.currentTime = Math.min(0.5, Math.max(0, video.duration / 2));
    };

    video.onseeked = async () => {
      try {
        // The poster is capped like any other still; the reported width/height below stay
        // the video's own, since they drive the player aspect and the VideoObject schema.
        const canvas = drawScaled(video, video.videoWidth, video.videoHeight);

        const [poster, thumbnail] = await Promise.all([
          toBlob(canvas, 'image/webp', 0.8),
          toBlob(canvas, 'image/jpeg', IMAGE_QUALITY),
        ]);

        const meta: VideoMeta = {
          width: video.videoWidth,
          height: video.videoHeight,
          durationSeconds: Math.round(video.duration),
          poster,
          thumbnail,
        };

        URL.revokeObjectURL(url);
        resolve(meta);
      } catch (error) {
        fail(error instanceof Error ? error.message : `Could not read video ${file.name}`);
      }
    };

    video.onerror = () => fail(`Could not read video ${file.name}`);
    video.src = url;
  });
}
