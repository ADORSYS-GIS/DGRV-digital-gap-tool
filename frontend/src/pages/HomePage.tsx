/**
 * Home page component that serves as the entry point for the application.
 * This page provides:
 * - Welcome information about the Digital Gap Assessment Tool
 * - Authentication flow for users
 * - Overview of key features and benefits
 * - Information about the tool's purpose and support
 */
import { useEffect } from "react";
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
} from "lucide-react";

export const Welcome: React.FC = () => {
  const { isAuthenticated, loading, user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAuthenticated) return;

    const roles = user?.roles || user?.realm_access?.roles || [];
    const isAdmin = roles.includes("Dgrv_Admin");
    const isOrgUser = roles.includes("Org_User");

    if (window.location.pathname === "/") {
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else if (isOrgUser) {
        navigate("/dashboard", { replace: true });
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

    const roles = user?.roles || user?.realm_access?.roles || [];
    if (roles.includes("Dgrv_Admin")) {
      navigate("/admin/dashboard");
    } else if (roles.includes("Org_User")) {
      navigate("/dashboard");
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Digital Gap Assessment",
      description:
        "Comprehensive evaluation across 8 key perspectives to measure your current digital maturity level.",
    },
    {
      icon: Target,
      title: "Digital Strategy Planning",
      description:
        "Define your target digital state and create actionable plans to bridge the gaps.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your digital transformation journey with annual comparisons and performance metrics.",
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: "Cooperative Empowerment",
      description:
        "Designed specifically for cooperatives in Southern Africa and beyond.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with encrypted data storage and regular backups.",
    },
    {
      icon: Globe,
      title: "Accessible Everywhere",
      description:
        "Works online and offline, optimized for low-bandwidth environments.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Assess Current Level",
      description:
        "Evaluate your current digital maturity across 8 perspectives",
    },
    {
      number: 2,
      title: "Define Target Level",
      description: "Set your desired digital transformation goals",
    },
    {
      number: 3,
      title: "Analyze Gaps",
      description: "Identify priority areas and get tailored recommendations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="mb-12">
              <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8">
                <img
                  src="/dgrv-logo.png"
                  alt="DGRV Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Digital Gap Assessment Tool
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
                Empowering Cooperatives Through Digital Transformation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                A comprehensive tool developed by DGRV with BMZ support to help
                cooperatives measure, analyze, and close their digitalization
                gaps through strategic assessment and actionable
                recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                  onClick={handleGetStarted}
                >
                  {isAuthenticated ? "Continue to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100"
                >
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Tool
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-100"
                >
                  <benefit.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partners Section */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-8">
              Supported by
            </h2>
            <div className="flex items-center justify-center space-x-8">
              <div className="w-24 h-24">
                <img
                  src="/dgrv-logo.png"
                  alt="DGRV"
                  className="w-full h-full object-contain opacity-80"
                />
              </div>
              <div
                className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-50
               font-semibold"
              >
                Adorsys
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
