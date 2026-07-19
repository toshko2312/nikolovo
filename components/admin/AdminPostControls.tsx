'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/routes';
import PostDialog from './PostDialog';
import { useAdminSession } from './useAdminSession';

const LABEL: Record<Locale, string> = { bg: 'Добави секция', en: 'Add section' };

/** Top-right "create section" button on the home page — visible only to a logged-in admin. */
export default function AdminPostControls({ locale }: { locale: Locale }) {
  const isAdmin = useAdminSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="admin-bar-right">
      <button type="button" className="btn-accent admin-add" onClick={() => setOpen(true)}>
        <span aria-hidden="true">＋</span> {LABEL[locale]}
      </button>

      <PostDialog
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
