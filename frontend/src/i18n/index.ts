import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import ss from "./locales/ss.json";
import zu from "./locales/zu.json";

const resources = {
  en: { translation: en.translation },
  de: { translation: de.translation },
  fr: { translation: fr.translation },
  pt: { translation: pt.translation },
  ss: { translation: ss.translation },
  zu: { translation: zu.translation },
};

export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "pt", name: "Português" },
  { code: "ss", name: "siSwati" },
  { code: "zu", name: "Zulu" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: supportedLanguages.map((l) => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: {
      useSuspense: true,
    },
  });

// Ensure the HTML lang attribute reflects the active language (a11y/SEO)
if (typeof document !== "undefined") {
  document.documentElement.lang =
    i18n.resolvedLanguage || i18n.language || "en";
}
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});

export default i18n;
