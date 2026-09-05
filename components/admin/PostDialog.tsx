'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createPost, updatePost, type PostInput } from '@/lib/admin/posts';
import { imageUrl, MEDIA_CACHE_CONTROL } from '@/lib/media';
import { navLabels, PAGE_ORDER, type Locale } from '@/lib/routes';
import type { HomePostRecord, LinkablePageKey } from '@/lib/types';
import { browserClient } from '@/lib/supabase-browser';
import { prepareUploads } from '@/lib/admin/actions';
import { prepareImage } from './media-meta';

const COPY = {
  bg: {
    addHeading: 'Нова секция',
    editHeading: 'Редакция на секция',
    eyebrowBg: 'Подзаглавие (BG)',
    eyebrowEn: 'Подзаглавие (EN)',
    titleBg: 'Заглавие (BG)',
    titleEn: 'Заглавие (EN)',
    bodyBg: 'Описание (BG)',
    bodyEn: 'Описание (EN)',
    optional: 'по избор',
    image: 'Снимка',
    dropzone: 'Пуснете снимка тук или кликнете, за да изберете',
    dropzoneHint: 'Една снимка, по избор',
    link: 'Връзка към страница',
    linkNone: 'без връзка',
    linkText: 'Текст на връзката (BG)',
    linkTextEn: 'Текст на връзката (EN)',
    cancel: 'Отказ',
    submit: 'Запази',
    saving: 'Записване…',
    close: 'Затвори',
    remove: 'Премахни',
    requiredTitles: 'Заглавието и подзаглавието на двата езика са задължителни.',
    requiredLinkText: 'Текстът на връзката е задължителен, ако е избрана страница.',
  },
  en: {
    addHeading: 'New section',
    editHeading: 'Edit section',
    eyebrowBg: 'Sub-title (BG)',
    eyebrowEn: 'Sub-title (EN)',
    titleBg: 'Title (BG)',
    titleEn: 'Title (EN)',
    bodyBg: 'Description (BG)',
    bodyEn: 'Description (EN)',
    optional: 'optional',
    image: 'Picture',
    dropzone: 'Drop a picture here, or click to choose',
    dropzoneHint: 'One picture, optional',
    link: 'Link to a page',
    linkNone: 'no link',
    linkText: 'Link text (BG)',
    linkTextEn: 'Link text (EN)',
    cancel: 'Cancel',
    submit: 'Save',
    saving: 'Saving…',
    close: 'Close',
    remove: 'Remove',
    requiredTitles: 'A title and sub-title in both languages are required.',
    requiredLinkText: 'Link text is required when a page is selected.',
  },
} satisfies Record<Locale, Record<string, string>>;

const LINKABLE_PAGES = PAGE_ORDER.filter((key): key is LinkablePageKey => key !== 'home');

type PickedImage = { file: File; previewUrl: string };

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Omit for create mode; pass the post being edited for edit mode. */
  post?: HomePostRecord;
};

export default function PostDialog({ locale, open, onClose, onSaved, post }: Props) {
  const t = COPY[locale];
  const isEdit = Boolean(post);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [eyebrowBg, setEyebrowBg] = useState('');
  const [eyebrowEn, setEyebrowEn] = useState('');
  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyBg, setBodyBg] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [existingImage, setExistingImage] = useState<HomePostRecord['image']>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [linkPage, setLinkPage] = useState<LinkablePageKey | ''>('');
  const [linkTextBg, setLinkTextBg] = useState('');
  const [linkTextEn, setLinkTextEn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    setError(null);

    if (post) {
      setEyebrowBg(post.eyebrow.bg);
      setEyebrowEn(post.eyebrow.en);
      setTitleBg(post.title.bg);
      setTitleEn(post.title.en);
      setBodyBg(post.body.bg);
      setBodyEn(post.body.en);
      setExistingImage(post.image);
      setLinkPage(post.link?.page ?? '');
      setLinkTextBg(post.link?.text.bg ?? '');
      setLinkTextEn(post.link?.text.en ?? '');
    } else {
      setEyebrowBg('');
      setEyebrowEn('');
      setTitleBg('');
      setTitleEn('');
      setBodyBg('');
      setBodyEn('');
      setExistingImage(null);
      setLinkPage('');
      setLinkTextBg('');
      setLinkTextEn('');
    }
    setImageRemoved(false);
    setPicked(null);
    // post is only read at the instant the dialog opens, not on every identity change.
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

    if (!eyebrowBg.trim() || !eyebrowEn.trim() || !titleBg.trim() || !titleEn.trim()) {
      setError(t.requiredTitles);
      return;
    }
    if (linkPage && (!linkTextBg.trim() || !linkTextEn.trim())) {
      setError(t.requiredLinkText);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let image: PostInput['image'] = null;

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

      const input: PostInput = {
        eyebrow: { bg: eyebrowBg.trim(), en: eyebrowEn.trim() },
        title: { bg: titleBg.trim(), en: titleEn.trim() },
        body: { bg: bodyBg.trim(), en: bodyEn.trim() },
        image,
        link: linkPage ? { page: linkPage, text: { bg: linkTextBg.trim(), en: linkTextEn.trim() } } : null,
      };

      if (isEdit && post) {
        await updatePost(post.id, input);
      } else {
        await createPost(input);
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
          <label className="eyebrow" htmlFor="eyebrowBg">
            {t.eyebrowBg}
          </label>
          <input
            id="eyebrowBg"
            className="field"
            value={eyebrowBg}
            onChange={(e) => setEyebrowBg(e.target.value)}
            onBlur={() => setEyebrowEn((value) => value || eyebrowBg)}
            required
          />

          <label className="eyebrow" htmlFor="eyebrowEn">
            {t.eyebrowEn}
          </label>
          <input
            id="eyebrowEn"
            className="field"
            value={eyebrowEn}
            onChange={(e) => setEyebrowEn(e.target.value)}
            required
          />

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

          <label className="eyebrow" htmlFor="bodyBg">
            {t.bodyBg} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="bodyBg"
            className="field"
            rows={3}
            value={bodyBg}
            onChange={(e) => setBodyBg(e.target.value)}
          />

          <label className="eyebrow" htmlFor="bodyEn">
            {t.bodyEn} <span className="admin-hint">({t.optional})</span>
          </label>
          <textarea
            id="bodyEn"
            className="field"
            rows={3}
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
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

          <label className="eyebrow" htmlFor="linkPage">
            {t.link}
          </label>
          <select
            id="linkPage"
            className="field"
            value={linkPage}
            onChange={(e) => setLinkPage(e.target.value as LinkablePageKey | '')}
          >
            <option value="">{t.linkNone}</option>
            {LINKABLE_PAGES.map((key) => (
              <option key={key} value={key}>
                {navLabels[key][locale]}
              </option>
            ))}
          </select>

          {linkPage ? (
            <>
              <label className="eyebrow" htmlFor="linkTextBg">
                {t.linkText}
              </label>
              <input
                id="linkTextBg"
                className="field"
                value={linkTextBg}
                onChange={(e) => setLinkTextBg(e.target.value)}
                required
              />

              <label className="eyebrow" htmlFor="linkTextEn">
                {t.linkTextEn}
              </label>
              <input
                id="linkTextEn"
                className="field"
                value={linkTextEn}
                onChange={(e) => setLinkTextEn(e.target.value)}
                required
              />
            </>
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
