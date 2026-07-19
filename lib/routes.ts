export type Locale = 'bg' | 'en';

export type PageKey = 'home' | 'events' | 'history' | 'landmarks' | 'gettingHere' | 'gallery';

export const PAGE_ORDER: PageKey[] = [
  'home',
  'events',
  'history',
  'landmarks',
  'gettingHere',
  'gallery',
];

export const paths: Record<PageKey, Record<Locale, string>> = {
  home: { bg: '/', en: '/en' },
  events: { bg: '/sabitiya', en: '/en/events' },
  history: { bg: '/istoriya', en: '/en/history' },
  landmarks: { bg: '/zabelezhitelnosti', en: '/en/landmarks' },
  gettingHere: { bg: '/kak-da-stignete', en: '/en/getting-here' },
  gallery: { bg: '/galeriya', en: '/en/gallery' },
};

export const navLabels: Record<PageKey, Record<Locale, string>> = {
  home: { bg: 'Начало', en: 'Home' },
  events: { bg: 'Събития', en: 'Events' },
  history: { bg: 'История', en: 'History' },
  landmarks: { bg: 'Забележителности', en: 'Landmarks' },
  gettingHere: { bg: 'Как да стигнете', en: 'Getting here' },
  gallery: { bg: 'Галерия', en: 'Gallery' },
};

/** Chrome strings (header, footer, controls) — page body copy stays in the page files. */
export const ui: Record<Locale, Record<string, string>> = {
  bg: {
    brandName: 'Николово',
    brandHomeLabel: 'Николово — начало',
    mainNav: 'Основна навигация',
    mobileNav: 'Мобилна навигация',
    themeTitle: 'Смени светла / тъмна тема',
    themeLabel: 'Смени тема',
    menuLabel: 'Отвори меню',
    langCode: 'BG',
    footerAbout: 'Село в област Хасково, България — край язовир Тракиец, на 24 км от Хасково.',
    footerExplore: 'Разгледай',
    footerContact: 'Контакт',
    footerTownHall: 'Кметство Николово',
    footerTel: 'тел. — уточни',
    footerEmail: 'имейл — уточни',
    footerCopyright: '© 2026 Николово · Област Хасково',
    footerPlaceholders: 'Снимките са заместители',
  },
  en: {
    brandName: 'Nikolovo',
    brandHomeLabel: 'Nikolovo — home',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    themeTitle: 'Toggle light / dark theme',
    themeLabel: 'Toggle theme',
    menuLabel: 'Open menu',
    langCode: 'EN',
    footerAbout:
      'A village in Haskovo Province, Bulgaria — by the Trakiets Reservoir, 24 km from Haskovo.',
    footerExplore: 'Explore',
    footerContact: 'Contact',
    footerTownHall: 'Nikolovo Town Hall',
    footerTel: 'tel. — TBC',
    footerEmail: 'email — TBC',
    footerCopyright: '© 2026 Nikolovo · Haskovo Province',
    footerPlaceholders: 'Placeholder photos',
  },
};

/**
 * hreflang set for a page. x-default points at the Bulgarian version, matching the
 * original hand-written `<link rel="alternate">` tags.
 */
export function languageAlternates(key: PageKey) {
  return {
    bg: paths[key].bg,
    en: paths[key].en,
    'x-default': paths[key].bg,
  };
}
