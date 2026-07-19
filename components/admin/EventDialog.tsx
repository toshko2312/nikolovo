'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DayPicker } from 'react-day-picker';
import { bg as bgLocale, enGB } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import {
  createEvent,
  prepareUploads,
  updateEvent,
  type NewEventMedia,
  type UploadRequest,
  type UploadTarget,
} from '@/lib/admin/actions';
import { formatEventDate } from '@/lib/format';
import { imageUrl, MEDIA_CACHE_CONTROL } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { EventRecord } from '@/lib/types';
import { browserClient } from '@/lib/supabase-browser';
import { imageMeta, videoMeta, type ImageMeta, type VideoMeta } from './media-meta';

const COPY = {
  bg: {
    addHeading: 'Ново събитие',
    editHeading: 'Редакция на събитие',
    date: 'Дата',
    titleBg: 'Заглавие (BG)',
    titleEn: 'Заглавие (EN)',
    descriptionBg: 'Описание (BG)',
    descriptionEn: 'Описание (EN)',
    optional: 'по избор',
    media: 'Снимки и видео',
    dropzone: 'Пуснете файлове тук или кликнете, за да изберете',
    dropzoneHint: 'Снимки и видео, по избор',
    cancel: 'Отказ',
    submit: 'Запази',
    saving: 'Записване…',
    close: 'Затвори',
    remove: 'Премахни',
    required: 'Заглавието на двата езика е задължително.',
  },
  en: {
    addHeading: 'New event',
    editHeading: 'Edit event',
    date: 'Date',
    titleBg: 'Title (BG)',
    titleEn: 'Title (EN)',
    descriptionBg: 'Description (BG)',
    descriptionEn: 'Description (EN)',
    optional: 'optional',
    media: 'Photos and video',
    dropzone: 'Drop files here, or click to choose',
    dropzoneHint: 'Images and video, optional',
    cancel: 'Cancel',
    submit: 'Save',
    saving: 'Saving…',
    close: 'Close',
    remove: 'Remove',
    required: 'A title in both languages is required.',
  },
} satisfies Record<Locale, Record<string, string>>;

type Picked = { id: string; file: File; previewUrl: string; isVideo: boolean };
type ExistingMedia = { id: string; kind: 'image' | 'video'; previewUrl: string; removed: boolean };

function isoDay(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function existingMediaFrom(event: EventRecord): ExistingMedia[] {
  return event.media.map((item) => ({
    id: item.id,
    kind: item.kind,
    previewUrl: item.kind === 'image' ? imageUrl(item.path) : imageUrl(item.posterPath),
    removed: false,
  }));
}

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Omit for create mode; pass the event being edited for edit mode. */
  event?: EventRecord;
};

export default function EventDialog({ locale, open, onClose, onSaved, event }: Props) {
  const t = COPY[locale];
  const isEdit = Boolean(event);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [date, setDate] = useState<Date>(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBg, setDescriptionBg] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (Re)initialise form state each time the dialog opens.
  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    setError(null);
    setCalendarOpen(false);

    if (event) {
      setDate(new Date(`${event.date}T00:00:00`));
      setTitleBg(event.title.bg);
      setTitleEn(event.title.en);
      setDescriptionBg(event.description.bg);
      setDescriptionEn(event.description.en);
      setExistingMedia(existingMediaFrom(event));
    } else {
      setDate(new Date());
      setTitleBg('');
      setTitleEn('');
      setDescriptionBg('');
      setDescriptionEn('');
      setExistingMedia([]);
    }
    setPicked([]);
    // event is only read at the instant the dialog opens, not on every identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Object URLs for new-file previews have to be released by hand.
  useEffect(
    () => () => {
      picked.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [picked],
  );

  const onDrop = useCallback((files: File[]) => {
    setPicked((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
  });

  function requestClose() {
    dialogRef.current?.close();
    onClose();
  }

  async function upload(target: UploadTarget, body: Blob) {
    const { error: uploadError } = await browserClient()
      .storage.from(target.bucket)
      .uploadToSignedUrl(target.path, target.token, body, {
        cacheControl: MEDIA_CACHE_CONTROL,
        contentType: body.type || undefined,
      });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (busy) return;

    if (!titleBg.trim() || !titleEn.trim()) {
      setError(t.required);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const day = isoDay(date);

      // Read dimensions/duration and generate video posters before anything is uploaded,
      // so a broken file fails the whole submit instead of leaving orphans in storage.
      type Described =
        | { item: Picked; video: VideoMeta; image?: undefined }
        | { item: Picked; image: ImageMeta; video?: undefined };

      const described: Described[] = await Promise.all(
        picked.map(
          async (item): Promise<Described> =>
            item.isVideo
              ? { item, video: await videoMeta(item.file) }
              : { item, image: await imageMeta(item.file) },
        ),
      );

      const requests: UploadRequest[] = [];
      described.forEach(({ item, video }) => {
        requests.push({
          bucket: item.isVideo ? 'videos' : 'images',
          filename: item.file.name,
          slugHint: titleBg,
        });
        if (video) {
          requests.push({ bucket: 'images', filename: `${item.file.name}-poster.webp`, slugHint: titleBg });
          requests.push({ bucket: 'images', filename: `${item.file.name}-thumb.jpg`, slugHint: titleBg });
        }
      });

      const targets = requests.length ? await prepareUploads(requests) : [];

      const startVideoIndex = existingMedia.filter((m) => !m.removed && m.kind === 'video').length;
      const media: NewEventMedia[] = [];
      let cursor = 0;

      for (const entry of described) {
        const fileTarget = targets[cursor++];
        await upload(fileTarget, entry.item.file);

        if (entry.video) {
          const posterTarget = targets[cursor++];
          const thumbTarget = targets[cursor++];
          await upload(posterTarget, entry.video.poster);
          await upload(thumbTarget, entry.video.thumbnail);

          const index = startVideoIndex + media.filter((m) => m.kind === 'video').length + 1;
          media.push({
            kind: 'video',
            path: fileTarget.path,
            posterPath: posterTarget.path,
            thumbnailPath: thumbTarget.path,
            width: entry.video.width,
            height: entry.video.height,
            durationSeconds: entry.video.durationSeconds,
            titleBg: `${titleBg.trim()} — видео ${index}`,
            titleEn: `${titleEn.trim()} — video ${index}`,
            descriptionBg: descriptionBg.trim() || titleBg.trim(),
            descriptionEn: descriptionEn.trim() || titleEn.trim(),
          });
        } else if (entry.image) {
          media.push({
            kind: 'image',
            path: fileTarget.path,
            width: entry.image.width,
            height: entry.image.height,
            altBg: titleBg.trim(),
            altEn: titleEn.trim(),
          });
        }
      }

      if (isEdit && event) {
        await updateEvent({
          id: event.id,
          date: day,
          titleBg,
          titleEn,
          descriptionBg,
          descriptionEn,
          keepMediaIds: existingMedia.filter((m) => !m.removed).map((m) => m.id),
          newMedia: media,
        });
      } else {
        await createEvent({ date: day, titleBg, titleEn, descriptionBg, descriptionEn, media });
      }

      requestClose();
      onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="admin-dialog" onClose={onClose}>
      {open ? (
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-head">
            <h2>{isEdit ? t.editHeading : t.addHeading}</h2>
            <button type="button" className="icon-btn" onClick={requestClose} aria-label={t.close}>
              ✕
            </button>
          </div>

          <div className="admin-form-body">
          <label className="eyebrow">{t.date}</label>
          <button
            type="button"
            className="field field-button"
            onClick={() => setCalendarOpen((value) => !value)}
            aria-expanded={calendarOpen}
          >
            {formatEventDate(isoDay(date), locale)}
          </button>
          {calendarOpen ? (
            <div className="admin-calendar">
              <DayPicker
                mode="single"
                required
                selected={date}
                onSelect={(value) => {
                  if (value) setDate(value);
                  setCalendarOpen(false);
                }}
                locale={locale === 'bg' ? bgLocale : enGB}
                weekStartsOn={1}
              />
            </div>
          ) : null}

          <label className="eyebrow" htmlFor="titleBg">
            {t.titleBg}
          </label>
          <input
            id="titleBg"
            className="field"
            value={titleBg}
            onChange={(e) => setTitleBg(e.target.value)}
            onBlur={() => setTitleEn((value) => value || titleBg)}
            required
          />

          <label className="eyebrow" htmlFor="titleEn">
            {t.titleEn}
          </label>
          <input
            id="titleEn"
            className="field"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />

          <label className="eyebrow" htmlFor="descriptionBg">
            {t.descriptionBg} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="descriptionBg"
            className="field"
            rows={3}
            value={descriptionBg}
            onChange={(e) => setDescriptionBg(e.target.value)}
          />

          <label className="eyebrow" htmlFor="descriptionEn">
            {t.descriptionEn} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="descriptionEn"
            className="field"
            rows={3}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />

          <label className="eyebrow">{t.media}</label>
          <div {...getRootProps()} className={isDragActive ? 'dropzone dropzone-active' : 'dropzone'}>
            <input {...getInputProps()} />
            <p>{t.dropzone}</p>
            <p className="admin-hint">{t.dropzoneHint}</p>
          </div>

          {existingMedia.some((m) => !m.removed) || picked.length ? (
            <ul className="admin-previews">
              {existingMedia
                .filter((item) => !item.removed)
                .map((item) => (
                  <li key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt="" />
                    <button
                      type="button"
                      aria-label={t.remove}
                      onClick={() =>
                        setExistingMedia((current) =>
                          current.map((m) => (m.id === item.id ? { ...m, removed: true } : m)),
                        )
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              {picked.map((item) => (
                <li key={item.id}>
                  {item.isVideo ? (
                    <video src={item.previewUrl} muted playsInline preload="metadata" />
                  ) : (
                    // Local blob preview: next/image cannot optimise an object URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" />
                  )}
                  <button
                    type="button"
                    aria-label={t.remove}
                    onClick={() =>
                      setPicked((current) => current.filter((entry) => entry.id !== item.id))
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {error ? <p className="admin-error">{error}</p> : null}
          </div>

          <div className="admin-actions">
            <button type="button" className="field field-button" onClick={requestClose} disabled={busy}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-accent" disabled={busy}>
              {busy ? t.saving : t.submit}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
