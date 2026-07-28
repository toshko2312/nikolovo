'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteNews } from '@/lib/admin/news';
import type { Locale } from '@/lib/routes';
import type { NewsRecord } from '@/lib/types';
import NewsDialog from './NewsDialog';
import { useAdminSession } from './useAdminSession';

const COPY = {
  bg: { edit: 'Редактирай', delete: 'Изтрий', confirm: 'Наистина ли?', failed: 'Изтриването не успя' },
  en: { edit: 'Edit', delete: 'Delete', confirm: 'Are you sure?', failed: 'Delete failed' },
} satisfies Record<Locale, Record<string, string>>;

/** Small edit/delete controls rendered inside a post's header — admin only. */
export default function AdminNewsItemControls({
  item,
  locale,
}: {
  item: NewsRecord;
  locale: Locale;
}) {
  const isAdmin = useAdminSession();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (!isAdmin) return null;

  const t = COPY[locale];

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setFailure(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteNews(item.id);
      setConfirming(false);
      router.refresh();
    } catch (deleteError) {
      // Nowhere to render a message, so keep the button red and put it in the tooltip.
      setFailure(deleteError instanceof Error ? deleteError.message : t.failed);
    } finally {
      setDeleting(false);
    }
  }

  const danger = confirming || Boolean(failure);
  const deleteTitle = failure ?? (confirming ? t.confirm : t.delete);

  return (
    <div className="admin-item-controls">
      <button
        type="button"
        className="icon-btn admin-item-btn"
        onClick={() => setEditOpen(true)}
        aria-label={t.edit}
        title={t.edit}
      >
        ✎
      </button>
      <button
        type="button"
        className={danger ? 'icon-btn admin-item-btn admin-item-btn-danger' : 'icon-btn admin-item-btn'}
        onClick={handleDelete}
        onBlur={() => setConfirming(false)}
        disabled={deleting}
        aria-label={deleteTitle}
        title={deleteTitle}
      >
        {deleting ? '…' : failure ? '!' : confirming ? '✓' : '✕'}
      </button>

      <NewsDialog
        locale={locale}
        item={item}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
