'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/routes';
import EventDialog from './EventDialog';
import { useAdminSession } from './useAdminSession';

const LABEL: Record<Locale, string> = { bg: 'Добави събитие', en: 'Add event' };

/** Top-of-list "create event" button — visible only to a logged-in admin. */
export default function AdminEventControls({ locale }: { locale: Locale }) {
  const isAdmin = useAdminSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="admin-bar-top">
      <button type="button" className="btn-accent admin-add" onClick={() => setOpen(true)}>
        <span aria-hidden="true">＋</span> {LABEL[locale]}
      </button>

      <EventDialog
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
