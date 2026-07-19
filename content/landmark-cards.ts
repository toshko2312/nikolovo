import type { LandmarkCardRecord } from '@/lib/types';

/**
 * Local source of truth while USE_SUPABASE is false. Mirrors the seed rows in
 * supabase/migrations/20260721000001_landmark_cards.sql so the page looks the same
 * either way.
 */
export const landmarkCards: LandmarkCardRecord[] = [
  {
    id: 'church',
    sortOrder: 0,
    title: { bg: 'Православният храм', en: 'The Orthodox church' },
    text: {
      bg: 'Църквата на селото — сърцето на местния духовен живот.',
      en: 'The village church — the heart of local spiritual life.',
    },
    image: null,
    chip: { bg: 'снимка · храм', en: 'photo · church' },
  },
  {
    id: 'museum',
    sortOrder: 1,
    title: { bg: 'Музеят на селото', en: 'The village museum' },
    text: {
      bg: 'Пази живия спомен за миналите времена и бита на хората.',
      en: 'Keeps the living memory of times past and the everyday life of the people.',
    },
    image: null,
    chip: { bg: 'снимка · музей', en: 'photo · museum' },
  },
  {
    id: 'reservoir',
    sortOrder: 2,
    title: { bg: 'Язовир Тракиец', en: 'Trakiets Reservoir' },
    text: {
      bg: 'Водоемът край селото, дълго снабдявал Хасково с вода.',
      en: 'The body of water near the village that long supplied Haskovo with water.',
    },
    image: {
      path: 'yazovir-trakiec.jpg',
      width: 675,
      height: 348,
      alt: {
        bg: 'Язовир Тракиец край село Николово — въздушен изглед',
        en: 'Aerial view of the Trakiets Reservoir near Nikolovo, Haskovo Province',
      },
    },
    chip: null,
  },
  {
    id: 'square',
    sortOrder: 3,
    title: { bg: 'Селският площад', en: 'The village square' },
    text: {
      bg: 'Центърът на живота в Николово и място за срещи.',
      en: 'The centre of life in Nikolovo and a place to meet.',
    },
    image: null,
    chip: { bg: 'снимка · площад', en: 'photo · square' },
  },
  {
    id: 'houses',
    sortOrder: 4,
    title: { bg: 'Старите къщи', en: 'The old houses' },
    text: {
      bg: 'Традиционна архитектура, която пази духа на селото.',
      en: 'Traditional architecture that keeps the spirit of the village.',
    },
    image: null,
    chip: { bg: 'снимка · къщи', en: 'photo · houses' },
  },
  {
    id: 'surroundings',
    sortOrder: 5,
    title: { bg: 'Околностите', en: 'The surroundings' },
    text: {
      bg: 'Зелени хълмове и пътеки за разходка край селото.',
      en: 'Green hills and walking trails around the village.',
    },
    image: null,
    chip: { bg: 'снимка · околности', en: 'photo · surroundings' },
  },
];
