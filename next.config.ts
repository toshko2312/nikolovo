import type { NextConfig } from 'next';

/** Old hand-written `.html` URLs → clean App Router URLs. Keep these permanently. */
const htmlRedirects: Array<{ source: string; destination: string }> = [
  { source: '/index.html', destination: '/' },
  { source: '/sabitiya.html', destination: '/sabitiya' },
  { source: '/istoriya.html', destination: '/istoriya' },
  { source: '/zabelezhitelnosti.html', destination: '/zabelezhitelnosti' },
  { source: '/kak-da-stignete.html', destination: '/kak-da-stignete' },
  { source: '/galeriya.html', destination: '/galeriya' },
  { source: '/en/index.html', destination: '/en' },
  { source: '/en/events.html', destination: '/en/events' },
  { source: '/en/history.html', destination: '/en/history' },
  { source: '/en/landmarks.html', destination: '/en/landmarks' },
  { source: '/en/getting-here.html', destination: '/en/getting-here' },
  { source: '/en/gallery.html', destination: '/en/gallery' },
];

const nextConfig: NextConfig = {
  async redirects() {
    return htmlRedirects.map((r) => ({ ...r, permanent: true }));
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
