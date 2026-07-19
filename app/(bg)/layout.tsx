import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import ThemeScript from '@/components/ThemeScript';
import { SITE_URL } from '@/lib/site';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7f3' },
    { media: '(prefers-color-scheme: dark)', color: '#10130e' },
  ],
};

export default function BgLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400;1,6..72,500&family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap"
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
