'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { bg as bgLocale, enGB } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { createNews, updateNews, type NewsInput } from '@/lib/admin/news';
import { embedProviderName, resolveEmbed } from '@/lib/embed';
import { formatEventDate } from '@/lib/format';
import type { Locale } from '@/lib/routes';
import type { NewsRecord } from '@/lib/types';

const COPY = {
  bg: {
    addHeading: 'Нова новина',
    editHeading: 'Редакция на новина',
    date: 'Дата',
    titleBg: 'Заглавие (BG)',
    titleEn: 'Заглавие (EN)',
    descriptionBg: 'Описание (BG)',
    descriptionEn: 'Описание (EN)',
    optional: 'по избор',
    link: 'Връзка',
    linkHint: 'YouTube, Vimeo, Spotify, карта или обикновен адрес',
    linkEmbeds: 'Ще се покаже вградено',
    linkPlain: 'Ще се покаже като връзка',
    cancel: 'Отказ',
    submit: 'Запази',
    saving: 'Записване…',
    close: 'Затвори',
    required: 'Заглавието на двата езика е задължително.',
  },
  en: {
    addHeading: 'New news item',
    editHeading: 'Edit news item',
    date: 'Date',
    titleBg: 'Title (BG)',
    titleEn: 'Title (EN)',
    descriptionBg: 'Description (BG)',
    descriptionEn: 'Description (EN)',
    optional: 'optional',
    link: 'Link',
    linkHint: 'YouTube, Vimeo, Spotify, a map, or any plain address',
    linkEmbeds: 'Will be embedded',
    linkPlain: 'Will be shown as a link',
    cancel: 'Cancel',
    submit: 'Save',
    saving: 'Saving…',
    close: 'Close',
    required: 'A title in both languages is required.',
  },
} satisfies Record<Locale, Record<string, string>>;

function isoDay(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

type Props = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Omit for create mode; pass the item being edited for edit mode. */
  item?: NewsRecord;
};

export default function NewsDialog({ locale, open, onClose, onSaved, item }: Props) {
  const t = COPY[locale];
  const isEdit = Boolean(item);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [date, setDate] = useState<Date>(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [titleBg, setTitleBg] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBg, setDescriptionBg] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (Re)initialise form state each time the dialog opens.
  useEffect(() => {
    if (!open) return;

    dialogRef.current?.showModal();
    setError(null);
    setCalendarOpen(false);

    if (item) {
      setDate(new Date(`${item.date}T00:00:00`));
      setTitleBg(item.title.bg);
      setTitleEn(item.title.en);
      setDescriptionBg(item.description.bg);
      setDescriptionEn(item.description.en);
      setLink(item.link ?? '');
    } else {
      setDate(new Date());
      setTitleBg('');
      setTitleEn('');
      setDescriptionBg('');
      setDescriptionEn('');
      setLink('');
    }
    // item is only read at the instant the dialog opens, not on every identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lets the editor see whether a URL will embed before saving.
  const provider = useMemo(() => {
    const trimmed = link.trim();
    if (!trimmed) return null;
    return embedProviderName(resolveEmbed(trimmed));
  }, [link]);

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
      const input: NewsInput = {
        date: isoDay(date),
        title: { bg: titleBg.trim(), en: titleEn.trim() },
        description: { bg: descriptionBg.trim(), en: descriptionEn.trim() },
        link: link.trim() || null,
      };

      if (isEdit && item) {
        await updateNews(item.id, input);
      } else {
        await createNews(input);
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

            <label className="eyebrow" htmlFor="newsTitleBg">
              {t.titleBg}
            </label>
            <input
              id="newsTitleBg"
              className="field"
              value={titleBg}
              onChange={(e) => setTitleBg(e.target.value)}
              onBlur={() => setTitleEn((value) => value || titleBg)}
              required
            />

            <label className="eyebrow" htmlFor="newsTitleEn">
              {t.titleEn}
            </label>
            <input
              id="newsTitleEn"
              className="field"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />

            <label className="eyebrow" htmlFor="newsDescriptionBg">
              {t.descriptionBg} <span className="admin-hint">({t.optional})</span>
            </label>
            <textarea
              id="newsDescriptionBg"
              className="field"
              rows={3}
              value={descriptionBg}
              onChange={(e) => setDescriptionBg(e.target.value)}
            />

            <label className="eyebrow" htmlFor="newsDescriptionEn">
              {t.descriptionEn} <span className="admin-hint">({t.optional})</span>
            </label>
            <textarea
              id="newsDescriptionEn"
              className="field"
              rows={3}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
            />

            <label className="eyebrow" htmlFor="newsLink">
              {t.link} <span className="admin-hint">({t.optional})</span>
            </label>
            <input
              id="newsLink"
              className="field"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="admin-hint admin-embed-hint">
              {link.trim()
                ? provider
                  ? `${t.linkEmbeds} — ${provider}`
                  : t.linkPlain
                : t.linkHint}
            </p>

            {error ? <p className="admin-error">{error}</p> : null}
          </div>

          <div className="admin-actions">
            <button
              type="button"
              className="field field-button"
              onClick={requestClose}
              disabled={busy}
            >
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
