import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import ptTranslation from './locales/pt.json';
import ssTranslation from './locales/ss.json';
import zuTranslation from './locales/zu.json';

const resources = {
  en: {
    translation: enTranslation.translation,
  },
  de: {
    translation: deTranslation.translation,
  },
  fr: {
    translation: frTranslation.translation,
  },
  pt: {
    translation: ptTranslation.translation,
  },
  ss: {
    translation: ssTranslation.translation,
  },
  zu: {
    translation: zuTranslation.translation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;