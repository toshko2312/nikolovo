import Link from 'next/link';
import { PAGE_ORDER, navLabels, paths, ui, type Locale } from '@/lib/routes';

export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = ui[locale];

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand-row">
            <span className="brand-mark">Н</span>
            <span className="brand-name">{t.brandName}</span>
          </div>
          <p className="footer-about">{t.footerAbout}</p>
        </div>
        <div>
          <div className="footer-head">{t.footerExplore}</div>
          <div className="footer-links">
            {PAGE_ORDER.map((key) => (
              <Link key={key} href={paths[key][locale]}>
                {navLabels[key][locale]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-head">{t.footerContact}</div>
          <div className="footer-contact">
            <span>{t.footerTownHall}</span>
            <span className="mono" style={{ fontSize: 13 }}>
              {t.footerTel}
            </span>
            <span className="mono" style={{ fontSize: 13 }}>
              {t.footerEmail}
            </span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>{t.footerCopyright}</span>
          <span>{t.footerPlaceholders}</span>
        </div>
      </div>
    </footer>
  );
}
