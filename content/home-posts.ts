import type { HomePostRecord } from '@/lib/types';

/**
 * Local source of truth while USE_SUPABASE is false. Mirrors the seed rows inserted by
 * supabase/migrations/20260720000001_home_posts.sql exactly, so switching the flag never
 * changes what the home page shows.
 */
export const homePosts: HomePostRecord[] = [
  {
    id: 'history',
    sortOrder: 0,
    eyebrow: { bg: 'История', en: 'History' },
    title: { bg: 'От Ески кьой до Николово', en: 'From Eski Köy to Nikolovo' },
    body: {
      bg: 'До 1906 г. селото носи името Ески кьой, по-късно Старо село, а през 1950 г. е преименувано на Николово. В него живеят само православни християни.',
      en: 'Until 1906 the village was named Eski Köy, later Staro Selo (“Old Village”), and in 1950 it was renamed Nikolovo. Its residents are all Orthodox Christians.',
    },
    image: null,
    link: { page: 'history', text: { bg: 'Прочети историята →', en: 'Read the history →' } },
  },
  {
    id: 'nature',
    sortOrder: 1,
    eyebrow: { bg: 'Природа', en: 'Nature' },
    title: { bg: 'Водите на Тракиец', en: 'The waters of Trakiets' },
    body: {
      bg: 'В землището на селото е разположен язовир Тракиец, който дълги години снабдява град Хасково с питейна вода.',
      en: 'The Trakiets Reservoir lies within the village lands and for many years supplied the town of Haskovo with drinking water.',
    },
    image: {
      path: 'yazovir-trakiec.jpg',
      width: 675,
      height: 348,
      alt: {
        bg: 'Язовир Тракиец край село Николово, област Хасково — въздушен изглед',
        en: 'Aerial view of the Trakiets Reservoir near the village of Nikolovo, Haskovo Province',
      },
    },
    link: null,
  },
  {
    id: 'legend',
    sortOrder: 2,
    eyebrow: { bg: 'Предание', en: 'Legend' },
    title: { bg: 'Легендата за „Света Богородица“', en: 'The legend of “Sveta Bogoroditsa”' },
    body: {
      bg: 'Според местно предание най-голямата църква в Хасково — „Света Богородица“ — е построена по проекта на църквата в Николово.',
      en: 'According to local lore, the largest church in Haskovo — “Sveta Bogoroditsa” (Holy Mother of God) — was built to the design of the church in Nikolovo.',
    },
    image: null,
    link: null,
  },
  {
    id: 'memory',
    sortOrder: 3,
    eyebrow: { bg: 'Памет', en: 'Memory' },
    title: { bg: 'Музеят на селото', en: 'The village museum' },
    body: {
      bg: 'В Николово има музей, който пази живия спомен за миналите времена и разказва историята на хората от селото.',
      en: 'Nikolovo has a museum that keeps the living memory of times past and tells the story of the village’s people.',
    },
    image: null,
    link: { page: 'landmarks', text: { bg: 'Виж забележителностите →', en: 'See the landmarks →' } },
  },
  {
    id: 'tradition',
    sortOrder: 4,
    eyebrow: { bg: 'Традиция', en: 'Tradition' },
    title: { bg: 'Съборът в края на август', en: 'The fair in late August' },
    body: {
      bg: 'Всяка година в последната събота на август (около 28 август) селото се събира на традиционния събор.',
      en: 'Every year on the last Saturday of August (around 28 August) the village gathers for its traditional fair.',
    },
    image: null,
    link: null,
  },
];
