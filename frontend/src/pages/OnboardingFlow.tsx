import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, LucideProps } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/shared/useAuth";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OnboardingCompletion from "@/components/onboarding/OnboardingCompletion";
import ProgressIndicators from "@/components/onboarding/ProgressIndicators";
import { ROLES } from "@/constants/roles";

interface OnboardingStepData {
  icon: React.ComponentType<LucideProps>;
  title: string;
  titleHighlight: string;
  description: string;
  color: string;
  bgColor: string;
}

const onboardingSteps: OnboardingStepData[] = [
  {
    icon: BarChart3,
    title: "Assess Your Current",
    titleHighlight: "Digitalization Level",
    description:
      "Quickly evaluate where your cooperative stands today in its digital transformation journey.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Define Your Future",
    titleHighlight: "'To-Be' Goals",
    description:
      "Set your vision for the level of digitalization you want to achieve and create your roadmap.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Analyze Results &",
    titleHighlight: "Close the Gap",
    description:
      "Get personalized recommendations and actionable strategies to drive your cooperative forward.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export default function EnhancedOnboardingFlow() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
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
        if (roles.includes(ROLES.ADMIN)) {
          navigate("/admin/dashboard");
        } else if (roles.includes(ROLES.ORG_ADMIN)) {
          navigate("/second-admin/dashboard");
        } else if (roles.includes(ROLES.COOP_ADMIN)) {
          navigate("/third-admin/dashboard");
        } else if (roles.includes(ROLES.Org_User)) {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    }
  }, [user, navigate, roles]);

  const handleGetStarted = () => {
    if (user?.sub) {
      localStorage.setItem(`onboarding_completed_${user.sub}`, "true");
    }

    if (roles.includes(ROLES.ADMIN)) {
      navigate("/admin/dashboard");
    } else if (roles.includes(ROLES.ORG_ADMIN)) {
      navigate("/second-admin/dashboard");
    } else if (roles.includes(ROLES.COOP_ADMIN)) {
      navigate("/third-admin/dashboard");
    } else if (roles.includes(ROLES.Org_User)) {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const currentStepData = onboardingSteps[currentStep];

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
          totalSteps={onboardingSteps.length}
          currentStep={currentStep}
          isCompleted={showCompletion}
        />

        {showCompletion ? (
          <OnboardingCompletion
            isTransitioning={isTransitioning}
            handlePrevious={handlePrevious}
          />
        ) : (
          <OnboardingStep
            step={currentStepData}
            isTransitioning={isTransitioning}
            currentStep={currentStep}
            totalSteps={onboardingSteps.length}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />
        )}

        {!showCompletion && (
          <div className="flex justify-center mt-8 space-x-2">
            {onboardingSteps.map((step, index) => (
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
