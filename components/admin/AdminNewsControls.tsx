'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/routes';
import NewsDialog from './NewsDialog';
import { useAdminSession } from './useAdminSession';

const LABEL: Record<Locale, string> = { bg: 'Добави новина', en: 'Add news' };

/** Top-of-list "create news" button — visible only to a logged-in admin. */
export default function AdminNewsControls({ locale }: { locale: Locale }) {
  const isAdmin = useAdminSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="admin-bar-top">
      <button type="button" className="btn-accent admin-add" onClick={() => setOpen(true)}>
        <span aria-hidden="true">＋</span> {LABEL[locale]}
      </button>

      <NewsDialog
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
