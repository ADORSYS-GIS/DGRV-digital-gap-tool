import { useState } from "react";

export type AdminLangFilter = "all" | "en" | "fr" | "pt" | "ss";

export const useAdminLangFilter = (initial: AdminLangFilter = "en") => {
  const [lang, setLang] = useState<AdminLangFilter>(initial);
  return { lang, setLang };
};
