/**
 * Home page component that serves as the entry point for the application.
 * This page provides:
 * - Welcome information about the Digital Gap Assessment Tool
 * - Authentication flow for users
 * - Overview of key features and benefits
 * - Information about the tool's purpose and support
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/shared/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Shield,
  Globe,
  ArrowRight,
  HeartHandshake,
  Building2,
} from "lucide-react";
import { FeatureCard } from "@/components/home/FeatureCard";
import { BenefitCard } from "@/components/home/BenefitCard";
import { ROLES } from "@/constants/roles";

export const HomePage: React.FC = () => {
  const { isAuthenticated, loading, user, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize t

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    const hasCompletedOnboarding = localStorage.getItem(
      `onboarding_completed_${user?.sub}`,
    );
    const roles = (user?.roles || user?.realm_access?.roles || []).map((r) =>
      r.toLowerCase(),
    );
    const isAdmin = roles.includes(ROLES.ADMIN);
    const isOrgUser = roles.includes(ROLES.Org_User.toLowerCase());

    if (window.location.pathname === "/") {
      if (hasCompletedOnboarding) {
        if (isAdmin) navigate("/admin/dashboard", { replace: true });
        else if (isOrgUser) navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error) {
        toast.error("Failed to redirect to authentication. Please try again.");
      }
      return;
    }

    const hasCompletedOnboarding = localStorage.getItem(
      `onboarding_completed_${user?.sub}`,
    );
    const roles = (user?.roles || user?.realm_access?.roles || []).map((r) =>
      r.toLowerCase(),
    );
    if (hasCompletedOnboarding) {
      if (roles.includes(ROLES.ADMIN)) navigate("/admin/dashboard");
      else if (roles.includes(ROLES.Org_User.toLowerCase()))
        navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/dgrv.jpg" alt="DGRV Logo" className="h-10 w-auto" />
            <span className="text-xl font-semibold text-gray-700">DGAT</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => login()}
              >
                {t("home.login")}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t("home.hero.title")}
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
                {t("home.hero.subtitle")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                {t("home.hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  size="lg"
                  className="group px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated
                    ? t("home.continueToDashboard")
                    : t("home.getStarted")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/dgat.jpg"
                alt={t("home.hero.imageAlt")}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("home.features.title")}
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              {t("home.features.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              title={t("home.features.assessmentTitle")}
              description={t("home.features.assessmentDescription")}
            />
            <FeatureCard
              icon={<Target className="h-10 w-10" />}
              title={t("home.features.planningTitle")}
              description={t("home.features.planningDescription")}
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10" />}
              title={t("home.features.trackingTitle")}
              description={t("home.features.trackingDescription")}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("home.benefits.title")}
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              {t("home.benefits.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Users className="h-12 w-12 text-blue-600" />}
              title={t("home.benefits.empowermentTitle")}
              description={t("home.benefits.empowermentDescription")}
            />
            <BenefitCard
              icon={<Shield className="h-12 w-12 text-blue-600" />}
              title={t("home.benefits.securityTitle")}
              description={t("home.benefits.securityDescription")}
            />
            <BenefitCard
              icon={<Globe className="h-12 w-12 text-blue-600" />}
              title={t("home.benefits.accessibilityTitle")}
              description={t("home.benefits.accessibilityDescription")}
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("home.partners.title")}
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            {t("home.partners.description")}
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-16">
            <div className="flex flex-col items-center">
              <Building2 className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">DGRV</h3>
              <p className="text-gray-600">
                {t("home.partners.dgrvDescription")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <HeartHandshake className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">BMZ</h3>
              <p className="text-gray-600">
                {t("home.partners.bmzDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 md:p-16 text-center text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t("home.cta.description")}
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-lg transform hover:scale-105 transition-transform"
              onClick={handleGetStarted}
            >
              {isAuthenticated
                ? t("home.goToDashboard")
                : t("home.getStartedNow")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p className="mb-4">
            © {new Date().getFullYear()} {t("home.footer.copyright")}.{" "}
            {t("home.footer.allRightsReserved")}
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("home.footer.privacyPolicy")}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("home.footer.termsOfService")}
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              {t("home.footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};