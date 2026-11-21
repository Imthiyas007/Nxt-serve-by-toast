import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enUS from './locales/en-US/common.json';
import es from './locales/es/common.json';
import zh from './locales/zh/common.json';
import vi from './locales/vi/common.json';
import fr from './locales/fr/common.json';
import pt from './locales/pt/common.json';
import fil from './locales/fil/common.json';
import hi from './locales/hi/common.json';
import ar from './locales/ar/common.json';
import ta from './locales/ta/common.json';
import ko from './locales/ko/common.json';
import { SUPPORTED_LANGUAGES } from './locales/languages';
import { UI_TRANSLATIONS } from './locales/ui';

const localeResources = {
  'en-US': enUS,
  es,
  zh,
  vi,
  fr,
  pt,
  fil,
  hi,
  ar,
  ta,
  ko,
};

const updateDocumentLanguage = (language) => {
  const resolvedLanguage = i18n.resolvedLanguage || language;
  document.documentElement.lang = resolvedLanguage;
  document.documentElement.dir = i18n.dir(resolvedLanguage);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-US',
    supportedLngs: SUPPORTED_LANGUAGES.map(({ code }) => code),
    resources: Object.fromEntries(
      SUPPORTED_LANGUAGES.map(({ code }) => [
        code,
        { common: { ...localeResources[code], ...UI_TRANSLATIONS[code] } },
      ])
    ),
    ns: ['common'],
    defaultNS: 'common',
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
      lookupCookie: 'i18next',
      cookieMinutes: 525600,
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => updateDocumentLanguage(i18n.resolvedLanguage || i18n.language));

i18n.on('languageChanged', updateDocumentLanguage);

export default i18n;
