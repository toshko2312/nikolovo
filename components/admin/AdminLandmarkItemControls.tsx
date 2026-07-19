'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLandmark } from '@/lib/admin/landmarks';
import type { Locale } from '@/lib/routes';
import type { LandmarkCardRecord } from '@/lib/types';
import LandmarkDialog from './LandmarkDialog';
import { useAdminSession } from './useAdminSession';

const COPY = {
  bg: { edit: 'Редактирай', delete: 'Изтрий', confirm: 'Наистина ли?' },
  en: { edit: 'Edit', delete: 'Delete', confirm: 'Are you sure?' },
} satisfies Record<Locale, Record<string, string>>;

/** Edit/delete controls in the corner of a landmark card — admin only. */
export default function AdminLandmarkItemControls({
  card,
  locale,
}: {
  card: LandmarkCardRecord;
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
      await deleteLandmark(card.id);
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

      <LandmarkDialog
        locale={locale}
        card={card}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
