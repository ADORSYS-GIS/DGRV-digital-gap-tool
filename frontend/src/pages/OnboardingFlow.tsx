import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, LucideProps } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OnboardingCompletion from "@/components/onboarding/OnboardingCompletion";
import ProgressIndicators from "@/components/onboarding/ProgressIndicators";
import { ROLES } from "@/constants/roles";
import { useTranslation } from "react-i18next";

interface OnboardingStepData {
  icon: React.ComponentType<LucideProps>;
  title: string;
  titleHighlight: string;
  description: string;
  color: string;
  bgColor: string;
}

const onboardingSteps = (t: (key: string) => string): OnboardingStepData[] => [
  {
    icon: BarChart3,
    title: t("onboarding.step1.title"),
    titleHighlight: t("onboarding.step1.titleHighlight"),
    description: t("onboarding.step1.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: t("onboarding.step2.title"),
    titleHighlight: t("onboarding.step2.titleHighlight"),
    description: t("onboarding.step2.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: t("onboarding.step3.title"),
    titleHighlight: t("onboarding.step3.titleHighlight"),
    description: t("onboarding.step3.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export default function EnhancedOnboardingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const steps = onboardingSteps(t);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 250);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowCompletion(true);
        setIsTransitioning(false);
      }, 250);
    }
  };

  const handlePrevious = () => {
    if (showCompletion) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowCompletion(false);
        setIsTransitioning(false);
      }, 250);
    } else if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  useEffect(() => {
    if (user?.sub) {
      const hasCompletedOnboarding = localStorage.getItem(
        `onboarding_completed_${user.sub}`,
      );
      if (hasCompletedOnboarding) {
        if (user?.roles?.includes(ROLES.ADMIN)) {
          navigate("/admin/dashboard");
        } else if (user?.roles?.includes(ROLES.ORG_ADMIN)) {
          navigate("/second-admin/dashboard");
        } else if (user?.roles?.includes(ROLES.COOP_ADMIN)) {
          navigate("/third-admin/dashboard");
        } else if (user?.roles?.includes(ROLES.COOP_USER)) {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    if (user?.sub) {
      localStorage.setItem(`onboarding_completed_${user.sub}`, "true");
    }

    if (user?.roles?.includes(ROLES.ADMIN)) {
      navigate("/admin/dashboard");
    } else if (user?.roles?.includes(ROLES.ORG_ADMIN)) {
      navigate("/second-admin/dashboard");
    } else if (user?.roles?.includes(ROLES.COOP_ADMIN)) {
      navigate("/third-admin/dashboard");
    } else if (user?.roles?.includes(ROLES.COOP_USER)) {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600">Please refresh the page to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <ProgressIndicators
          totalSteps={steps.length}
          currentStep={currentStep}
          isCompleted={showCompletion}
        />

        {showCompletion ? (
          <OnboardingCompletion
            isTransitioning={isTransitioning}
            handleGetStarted={handleGetStarted}
            handlePrevious={handlePrevious}
          />
        ) : (
          <OnboardingStep
            step={currentStepData}
            isTransitioning={isTransitioning}
            currentStep={currentStep}
            totalSteps={steps.length}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />
        )}

        {!showCompletion && (
          <div className="flex justify-center mt-8 space-x-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? step.color.replace("text-", "bg-")
                    : index < currentStep
                      ? "bg-green-400"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
