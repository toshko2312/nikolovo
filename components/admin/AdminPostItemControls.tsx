'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePost } from '@/lib/admin/posts';
import type { Locale } from '@/lib/routes';
import type { HomePostRecord } from '@/lib/types';
import PostDialog from './PostDialog';
import { useAdminSession } from './useAdminSession';

const COPY = {
  bg: { edit: 'Редактирай', delete: 'Изтрий', confirm: 'Наистина ли?' },
  en: { edit: 'Edit', delete: 'Delete', confirm: 'Are you sure?' },
} satisfies Record<Locale, Record<string, string>>;

/** Small edit/delete controls in the corner of a home-page section — admin only. */
export default function AdminPostItemControls({
  post,
  locale,
}: {
  post: HomePostRecord;
  locale: Locale;
}) {
  const isAdmin = useAdminSession();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const t = COPY[locale];

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await deletePost(post.id);
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

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
        className={confirming ? 'icon-btn admin-item-btn admin-item-btn-danger' : 'icon-btn admin-item-btn'}
        onClick={handleDelete}
        onBlur={() => setConfirming(false)}
        disabled={deleting}
        aria-label={confirming ? t.confirm : t.delete}
        title={confirming ? t.confirm : t.delete}
      >
        {deleting ? '…' : confirming ? '✓' : '✕'}
      </button>

      <PostDialog
        locale={locale}
        post={post}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
