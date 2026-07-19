'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PAGE_ORDER, navLabels, paths, ui, type Locale, type PageKey } from '@/lib/routes';

export default function SiteHeader({ locale, current }: { locale: Locale; current: PageKey }) {
  const t = ui[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const langRef = useRef<HTMLDetailsElement>(null);

  // The inline pre-paint script owns the initial class; sync the icon to it after hydration.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const lang = langRef.current;
    if (!lang) return;

    const onClick = (e: MouseEvent) => {
      if (lang.open && !lang.contains(e.target as Node)) lang.open = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lang.open = false;
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('nikolovo-theme', dark ? 'dark' : 'light');
    } catch {
      // Private browsing — the toggle still works for this page view.
    }
    setIsDark(dark);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href={paths.home[locale]} aria-label={t.brandHomeLabel}>
          <span className="brand-mark">Н</span>
          <span className="brand-name">{t.brandName}</span>
        </Link>
        <div className="header-actions">
          <nav className="nav" aria-label={t.mainNav}>
            {PAGE_ORDER.map((key) => (
              <Link
                key={key}
                className="nav-link"
                href={paths[key][locale]}
                aria-current={key === current ? 'page' : undefined}
              >
                {navLabels[key][locale]}
              </Link>
            ))}
          </nav>
          <details className="lang-switch" ref={langRef}>
            <summary className="lang-btn" aria-label="Език / Language" title="Език / Language">
              {t.langCode} <span className="caret">▾</span>
            </summary>
            <div className="lang-menu">
              {(['bg', 'en'] as Locale[]).map((code) => (
                <a
                  key={code}
                  href={paths[current][code]}
                  hrefLang={code}
                  lang={code}
                  aria-current={code === locale ? 'true' : undefined}
                >
                  {code === 'bg' ? 'Български' : 'English'}
                </a>
              ))}
            </div>
          </details>
          <button
            id="themeBtn"
            className="icon-btn"
            type="button"
            title={t.themeTitle}
            aria-label={t.themeLabel}
            onClick={toggleTheme}
          >
            {isDark ? '☀' : '☾'}
          </button>
          <button
            id="navToggle"
            className="icon-btn nav-toggle"
            type="button"
            aria-label={t.menuLabel}
            aria-expanded={menuOpen}
            aria-controls="mobileNav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>
        </div>
      </div>
      <nav
        className={menuOpen ? 'mobile-nav open' : 'mobile-nav'}
        id="mobileNav"
        aria-label={t.mobileNav}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setMenuOpen(false);
        }}
      >
        {PAGE_ORDER.map((key) => (
          <Link
            key={key}
            href={paths[key][locale]}
            aria-current={key === current ? 'page' : undefined}
          >
            {navLabels[key][locale]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
