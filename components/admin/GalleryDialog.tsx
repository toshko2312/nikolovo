'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { prepareUploads } from '@/lib/admin/actions';
import {
  createGalleryPhoto,
  updateGalleryPhoto,
  type GalleryPhotoInput,
} from '@/lib/admin/gallery';
import { imageUrl, MEDIA_CACHE_CONTROL } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { GalleryPhotoRecord } from '@/lib/types';
import { browserClient } from '@/lib/supabase-browser';
import { prepareImage } from './media-meta';

const COPY = {
  bg: {
    addHeading: 'Нова снимка',
    editHeading: 'Редакция на снимка',
    captionBg: 'Етикет (BG)',
    captionEn: 'Етикет (EN)',
    captionHint: 'Показва се върху снимката и служи за alt текст.',
    image: 'Снимка',
    dropzone: 'Пуснете снимка тук или кликнете, за да изберете',
    dropzoneHint: 'Една снимка',
    cancel: 'Отказ',
    submit: 'Запази',
    saving: 'Записване…',
    close: 'Затвори',
    remove: 'Премахни',
    required: 'Етикетът на двата езика е задължителен.',
    imageRequired: 'Снимката е задължителна.',
  },
  en: {
    addHeading: 'New photo',
    editHeading: 'Edit photo',
    captionBg: 'Tag (BG)',
    captionEn: 'Tag (EN)',
    captionHint: 'Shown over the photo and used as its alt text.',
    image: 'Photo',
    dropzone: 'Drop a picture here, or click to choose',
    dropzoneHint: 'One picture',
    cancel: 'Cancel',
    submit: 'Save',
    saving: 'Saving…',
    close: 'Close',
    remove: 'Remove',
    required: 'A tag in both languages is required.',
    imageRequired: 'A photo is required.',
  },
} satisfies Record<Locale, Record<string, string>>;

type PickedImage = { file: File; previewUrl: string };

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Omit for create mode; pass the photo being edited for edit mode. */
  photo?: GalleryPhotoRecord;
};

export default function GalleryDialog({ locale, open, onClose, onSaved, photo }: Props) {
  const t = COPY[locale];
  const isEdit = Boolean(photo);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [captionBg, setCaptionBg] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [existingImage, setExistingImage] = useState<GalleryPhotoRecord['image'] | null>(null);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    setError(null);

    if (photo) {
      setCaptionBg(photo.caption.bg);
      setCaptionEn(photo.caption.en);
      setExistingImage(photo.image);
    } else {
      setCaptionBg('');
      setCaptionEn('');
      setExistingImage(null);
    }
    setPicked(null);
    // photo is only read at the instant the dialog opens, not on every identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl);
    },
    [picked],
  );

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPicked((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  function requestClose() {
    dialogRef.current?.close();
    onClose();
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (busy) return;

    if (!captionBg.trim() || !captionEn.trim()) {
      setError(t.required);
      return;
    }
    // A gallery row is nothing but its photo, so unlike the other dialogs it cannot be empty.
    if (!picked && !existingImage) {
      setError(t.imageRequired);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const caption = { bg: captionBg.trim(), en: captionEn.trim() };
      let image = existingImage;

      if (picked) {
        const prepared = await prepareImage(picked.file);
        const [target] = await prepareUploads([
          { bucket: 'images', filename: prepared.filename, slugHint: captionBg },
        ]);
        const { error: uploadError } = await browserClient()
          .storage.from(target.bucket)
          .uploadToSignedUrl(target.path, target.token, prepared.blob, {
            cacheControl: MEDIA_CACHE_CONTROL,
            contentType: prepared.blob.type || undefined,
          });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        image = {
          path: target.path,
          width: prepared.width,
          height: prepared.height,
          alt: caption,
        };
      }

      if (!image) throw new Error(t.imageRequired);

      // The caption is the alt text, so a caption-only edit has to carry it through.
      const input: GalleryPhotoInput = { image: { ...image, alt: caption }, caption };

      if (isEdit && photo) {
        await updateGalleryPhoto(photo.id, input);
      } else {
        await createGalleryPhoto(input);
      }

      requestClose();
      onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const showExistingImage = existingImage && !picked;

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
            <label className="eyebrow" htmlFor="galleryCaptionBg">
              {t.captionBg}
            </label>
            <input
              id="galleryCaptionBg"
              className="field"
              value={captionBg}
              onChange={(e) => setCaptionBg(e.target.value)}
              onBlur={() => setCaptionEn((value) => value || captionBg)}
              required
            />

            <label className="eyebrow" htmlFor="galleryCaptionEn">
              {t.captionEn}
            </label>
            <input
              id="galleryCaptionEn"
              className="field"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              required
            />

            <p className="admin-hint">{t.captionHint}</p>

            <label className="eyebrow">{t.image}</label>
            <div {...getRootProps()} className={isDragActive ? 'dropzone dropzone-active' : 'dropzone'}>
              <input {...getInputProps()} />
              <p>{t.dropzone}</p>
              <p className="admin-hint">{t.dropzoneHint}</p>
            </div>

            {showExistingImage || picked ? (
              <ul className="admin-previews">
                {showExistingImage ? (
                  <li>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl(existingImage.path)} alt="" />
                  </li>
                ) : null}
                {picked ? (
                  <li>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={picked.previewUrl} alt="" />
                    <button
                      type="button"
                      aria-label={t.remove}
                      onClick={() => {
                        URL.revokeObjectURL(picked.previewUrl);
                        setPicked(null);
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ) : null}
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
