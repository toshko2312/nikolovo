'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { prepareUploads } from '@/lib/admin/actions';
import { createLandmark, updateLandmark, type LandmarkInput } from '@/lib/admin/landmarks';
import { imageUrl, MEDIA_CACHE_CONTROL } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { LandmarkCardRecord } from '@/lib/types';
import { browserClient } from '@/lib/supabase-browser';
import { prepareImage } from './media-meta';

const COPY = {
  bg: {
    addHeading: 'Ново място',
    editHeading: 'Редакция на място',
    titleBg: 'Заглавие (BG)',
    titleEn: 'Заглавие (EN)',
    textBg: 'Описание (BG)',
    textEn: 'Описание (EN)',
    optional: 'по избор',
    image: 'Снимка',
    dropzone: 'Пуснете снимка тук или кликнете, за да изберете',
    dropzoneHint: 'Една снимка, по избор',
    cancel: 'Отказ',
    submit: 'Запази',
    saving: 'Записване…',
    close: 'Затвори',
    remove: 'Премахни',
    required: 'Заглавието на двата езика е задължително.',
  },
  en: {
    addHeading: 'New place',
    editHeading: 'Edit place',
    titleBg: 'Title (BG)',
    titleEn: 'Title (EN)',
    textBg: 'Description (BG)',
    textEn: 'Description (EN)',
    optional: 'optional',
    image: 'Picture',
    dropzone: 'Drop a picture here, or click to choose',
    dropzoneHint: 'One picture, optional',
    cancel: 'Cancel',
    submit: 'Save',
    saving: 'Saving…',
    close: 'Close',
    remove: 'Remove',
    required: 'A title in both languages is required.',
  },
} satisfies Record<Locale, Record<string, string>>;

type PickedImage = { file: File; previewUrl: string };

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Omit for create mode; pass the card being edited for edit mode. */
  card?: LandmarkCardRecord;
};

export default function LandmarkDialog({ locale, open, onClose, onSaved, card }: Props) {
  const t = COPY[locale];
  const isEdit = Boolean(card);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [textBg, setTextBg] = useState('');
  const [textEn, setTextEn] = useState('');
  const [existingImage, setExistingImage] = useState<LandmarkCardRecord['image']>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    setError(null);

    if (card) {
      setTitleBg(card.title.bg);
      setTitleEn(card.title.en);
      setTextBg(card.text.bg);
      setTextEn(card.text.en);
      setExistingImage(card.image);
    } else {
      setTitleBg('');
      setTitleEn('');
      setTextBg('');
      setTextEn('');
      setExistingImage(null);
    }
    setImageRemoved(false);
    setPicked(null);
    // card is only read at the instant the dialog opens, not on every identity change.
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
    setImageRemoved(false);
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

    if (!titleBg.trim() || !titleEn.trim()) {
      setError(t.required);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let image: LandmarkInput['image'] = null;

      if (picked) {
        const prepared = await prepareImage(picked.file);
        const [target] = await prepareUploads([
          { bucket: 'images', filename: prepared.filename, slugHint: titleBg },
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
          alt: { bg: titleBg.trim(), en: titleEn.trim() },
        };
      } else if (existingImage && !imageRemoved) {
        image = existingImage;
      }

      const input: LandmarkInput = {
        title: { bg: titleBg.trim(), en: titleEn.trim() },
        text: { bg: textBg.trim(), en: textEn.trim() },
        image,
      };

      if (isEdit && card) {
        await updateLandmark(card.id, input);
      } else {
        await createLandmark(input);
      }

      requestClose();
      onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const showExistingImage = existingImage && !imageRemoved && !picked;

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
          <label className="eyebrow" htmlFor="landmarkTitleBg">
            {t.titleBg}
          </label>
          <input
            id="landmarkTitleBg"
            className="field"
            value={titleBg}
            onChange={(e) => setTitleBg(e.target.value)}
            onBlur={() => setTitleEn((value) => value || titleBg)}
            required
          />

          <label className="eyebrow" htmlFor="landmarkTitleEn">
            {t.titleEn}
          </label>
          <input
            id="landmarkTitleEn"
            className="field"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />

          <label className="eyebrow" htmlFor="landmarkTextBg">
            {t.textBg} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="landmarkTextBg"
            className="field"
            rows={3}
            value={textBg}
            onChange={(e) => setTextBg(e.target.value)}
          />

          <label className="eyebrow" htmlFor="landmarkTextEn">
            {t.textEn} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="landmarkTextEn"
            className="field"
            rows={3}
            value={textEn}
            onChange={(e) => setTextEn(e.target.value)}
          />

          <label className="eyebrow">
            {t.image} <span className="admin-hint">({t.optional})</span>
          </label>
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
                  <button type="button" aria-label={t.remove} onClick={() => setImageRemoved(true)}>
                    ✕
                  </button>
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
