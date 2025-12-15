import React from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";

const ProfileSettings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const currentCode = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-",
  )[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    try {
      // Persist explicitly; detector also caches this
      localStorage.setItem("i18nextLng", newLang);
    } catch {}
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t("navbar.profile")}</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("common.language")}
          </label>
          <select
            id="language"
            value={currentCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            aria-label={t("common.selectLanguage")}
          >
            {supportedLanguages.map((lng) => (
              <option key={lng.code} value={lng.code}>
                {lng.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            {t("common.selectLanguage")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
