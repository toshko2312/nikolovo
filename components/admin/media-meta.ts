/** A file the browser cannot decode would otherwise leave the form spinning forever. */
const METADATA_TIMEOUT_MS = 20000;

function withTimeout<T>(work: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), METADATA_TIMEOUT_MS),
    ),
  ]);
}

export type ImageMeta = { width: number; height: number };

export type VideoMeta = {
  width: number;
  height: number;
  durationSeconds: number;
  /** Shown by the <video> element before playback. */
  poster: Blob;
  /** jpg twin of the poster — schema.org thumbnailUrl, which crawlers prefer as jpg. */
  thumbnail: Blob;
};

export function imageMeta(file: File): Promise<ImageMeta> {
  return withTimeout(readImage(file), `Timed out reading image ${file.name}`);
}

function readImage(file: File): Promise<ImageMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
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
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const [poster, thumbnail] = await Promise.all([
          toBlob(canvas, 'image/webp', 0.8),
          toBlob(canvas, 'image/jpeg', 0.82),
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
