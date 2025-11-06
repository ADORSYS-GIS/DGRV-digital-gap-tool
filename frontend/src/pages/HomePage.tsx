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
  const { isAuthenticated, loading, user, login, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    const hasCompletedOnboarding = localStorage.getItem(
      `onboarding_completed_${user?.sub}`,
    );
    if (window.location.pathname === "/") {
      if (hasCompletedOnboarding) {
        if (roles.includes(ROLES.ADMIN)) {
          navigate("/admin/dashboard", { replace: true });
        } else if (roles.includes(ROLES.ORG_ADMIN)) {
          navigate("/second-admin/dashboard", { replace: true });
        } else if (roles.includes(ROLES.COOP_ADMIN)) {
          navigate("/third-admin/dashboard", { replace: true });
        } else if (roles.includes(ROLES.Org_User)) {
          navigate("/user/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate, roles]);

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
    if (hasCompletedOnboarding) {
      if (roles.includes(ROLES.ADMIN)) {
        navigate("/admin/dashboard");
      } else if (roles.includes(ROLES.ORG_ADMIN)) {
        navigate("/second-admin/dashboard");
      } else if (roles.includes(ROLES.COOP_ADMIN)) {
        navigate("/third-admin/dashboard");
      } else if (roles.includes(ROLES.Org_User)) {
        navigate("/user/dashboard");
      } else {
        navigate("/dashboard");
      }
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
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Digital Gap Assessment Tool
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
                Empowering Cooperatives Through Digital Transformation
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                A comprehensive tool by DGRV and BMZ to help cooperatives
                measure, analyze, and close digitalization gaps with strategic
                assessments and actionable recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  size="lg"
                  className="group px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? "Continue to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/dgat.jpg"
                alt="Digital Transformation"
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
              Key Features
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Everything you need to drive your cooperative's digital journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              title="Digital Gap Assessment"
              description="Comprehensive evaluation across 8 key perspectives to measure your current digital maturity level."
            />
            <FeatureCard
              icon={<Target className="h-10 w-10" />}
              title="Digital Strategy Planning"
              description="Define your target digital state and create actionable plans to bridge the gaps."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10" />}
              title="Progress Tracking"
              description="Monitor your digital transformation journey with annual comparisons and performance metrics."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose Our Tool?
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Built with the unique needs of cooperatives in mind.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Users className="h-12 w-12 text-blue-600" />}
              title="Cooperative Empowerment"
              description="Designed specifically for cooperatives in Southern Africa and beyond."
            />
            <BenefitCard
              icon={<Shield className="h-12 w-12 text-blue-600" />}
              title="Secure & Reliable"
              description="Enterprise-grade security with encrypted data storage and regular backups."
            />
            <BenefitCard
              icon={<Globe className="h-12 w-12 text-blue-600" />}
              title="Accessible Everywhere"
              description="Works online and offline, optimized for low-bandwidth environments."
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Developed with Support From
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            A collaborative effort to foster digital inclusion.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-16">
            <div className="flex flex-col items-center">
              <Building2 className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">DGRV</h3>
              <p className="text-gray-600">
                German Cooperative and Raiffeisen Confederation
              </p>
            </div>
            <div className="flex flex-col items-center">
              <HeartHandshake className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">BMZ</h3>
              <p className="text-gray-600">
                Federal Ministry for Economic Cooperation and Development
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
              Ready to Transform Your Cooperative?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Start your digital transformation journey today and unlock new
              opportunities for growth and efficiency.
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-lg transform hover:scale-105 transition-transform"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p className="mb-4">
            © {new Date().getFullYear()} Digital Gap Assessment Tool. All
            rights reserved.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
