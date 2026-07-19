'use client';

import { useEffect, useState } from 'react';

/** One fetch per page load, shared by every admin control that mounts. */
let sessionCheck: Promise<boolean> | null = null;

function checkSession(): Promise<boolean> {
  if (!sessionCheck) {
    sessionCheck = fetch('/api/admin/session')
      .then((response) => (response.ok ? response.json() : { admin: false }))
      .then((data) => Boolean(data.admin))
      .catch(() => false);
  }
  return sessionCheck;
}

export function useAdminSession(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    checkSession().then((admin) => {
      if (active) setIsAdmin(admin);
    });
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
}
