/**
 * Main layout component that provides consistent structure for all pages.
 * This layout includes:
 * - Global navigation bar
 * - Toast notifications
 * - Conditional navbar display based on route
 * - Consistent page structure
 */
import { Toaster } from "@/components/ui/sonner";
import * as React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";
import { toast } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    try {
      const browserLang = (navigator.language || "").split("-")[0];
      const supported = supportedLanguages.map((l) => l.code);
      if (!browserLang || !supported.includes(browserLang)) return;

      const currentCode = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
      if (currentCode === browserLang) return;

      const promptKey = `i18nLangPromptShown:${browserLang}`;
      if (typeof localStorage !== "undefined" && localStorage.getItem(promptKey) === "1") {
        return;
      }

      const languageName =
        supportedLanguages.find((l) => l.code === browserLang)?.name ||
        browserLang.toUpperCase();

      toast(t("common.languageSuggestion.title", { languageName }), {
        description: t("common.languageSuggestion.description", {
          browserLanguage: browserLang.toUpperCase(),
        }),
        action: {
          label: t("common.switch", "Switch"),
          onClick: () => {
            i18n.changeLanguage(browserLang);
            try {
              localStorage.setItem("i18nextLng", browserLang);
              localStorage.setItem(promptKey, "1");
            } catch {}
          },
        },
        cancel: {
          label: t("common.dismiss", "Dismiss"),
          onClick: () => {
            try {
              localStorage.setItem(promptKey, "1");
            } catch {}
          },
        },
      });
    } catch {
      // no-op
    }
    // Only run on mount
  }, []);

  // Routes that should not show the navbar (like login page if you have one)
  const routesWithoutNavbar = ["/login"];
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? "pt-16" : ""}>{children}</main>
      <Toaster />
    </div>
  );
};

export default MainLayout;
