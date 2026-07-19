import type { EventRecord } from '@/lib/types';

/**
 * Local source of truth for events while USE_SUPABASE is false.
 * scripts/migrate-to-supabase.ts uploads these files and inserts these rows verbatim,
 * so the shape here matches what the Supabase tables return.
 */
export const events: EventRecord[] = [
  {
    id: '24-mai-2026',
    slug: '24-mai-2026',
    date: '2026-05-24',
    published: true,
    title: {
      bg: 'Празнувахме 24 май в Читалището',
      en: 'We celebrated 24 May at the community centre',
    },
    description: {
      bg: 'Как село Николово отбеляза 24 май — Деня на българската просвета и култура и на славянската писменост — в местното Читалище.',
      en: 'How the village of Nikolovo marked 24 May — the Day of Bulgarian Education and Culture and of Slavonic Literature — at the local community centre (chitalishte).',
    },
    media: [
      {
        id: '24-mai-2026-photo-1',
        kind: 'image',
        sortOrder: 0,
        path: '24-mai-nikolovo-chitalishte-2026.jpg',
        width: 1400,
        height: 1050,
        alt: {
          bg: 'Жени от Николово празнуват 24 май пред Читалището, област Хасково',
          en: 'Women from Nikolovo celebrating 24 May in front of the community centre, Haskovo Province',
        },
      },
      {
        id: '24-mai-2026-video-1',
        kind: 'video',
        sortOrder: 1,
        path: '24-mai-nikolovo-2026-1.mp4',
        posterPath: '24-mai-nikolovo-2026-1-poster.webp',
        thumbnailPath: '24-mai-nikolovo-2026-1-poster.jpg',
        width: 568,
        height: 320,
        durationSeconds: 63,
        title: {
          bg: '24 май в Николово — момент 1',
          en: '24 May in Nikolovo — moment 1',
        },
        description: {
          bg: 'Празникът на 24 май в Читалището на село Николово, област Хасково.',
          en: 'The 24 May celebration at the community centre of the village of Nikolovo, Haskovo Province.',
        },
      },
      {
        id: '24-mai-2026-video-2',
        kind: 'video',
        sortOrder: 2,
        path: '24-mai-nikolovo-2026-2.mp4',
        posterPath: '24-mai-nikolovo-2026-2-poster.webp',
        thumbnailPath: '24-mai-nikolovo-2026-2-poster.jpg',
        width: 568,
        height: 320,
        durationSeconds: 65,
        title: {
          bg: '24 май в Николово — момент 2',
          en: '24 May in Nikolovo — moment 2',
        },
        description: {
          bg: 'Празникът на 24 май в Читалището на село Николово, област Хасково.',
          en: 'The 24 May celebration at the community centre of the village of Nikolovo, Haskovo Province.',
        },
      },
      {
        id: '24-mai-2026-video-3',
        kind: 'video',
        sortOrder: 3,
        path: '24-mai-nikolovo-2026-3.mp4',
        posterPath: '24-mai-nikolovo-2026-3-poster.webp',
        thumbnailPath: '24-mai-nikolovo-2026-3-poster.jpg',
        width: 320,
        height: 568,
        durationSeconds: 29,
        title: {
          bg: '24 май в Николово — момент 3',
          en: '24 May in Nikolovo — moment 3',
        },
        description: {
          bg: 'Празникът на 24 май в Читалището на село Николово, област Хасково.',
          en: 'The 24 May celebration at the community centre of the village of Nikolovo, Haskovo Province.',
        },
      },
    ],
  },
];
