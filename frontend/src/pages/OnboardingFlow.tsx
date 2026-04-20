import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, LucideProps } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OnboardingCompletion from "@/components/onboarding/OnboardingCompletion";
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

const getOnboardingSteps = (t: any): OnboardingStepData[] => [
  {
    icon: BarChart3,
    title: t("onboarding.steps.step0.title"),
    titleHighlight: t("onboarding.steps.step0.titleHighlight"),
    description: t("onboarding.steps.step0.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: t("onboarding.steps.step1.title"),
    titleHighlight: t("onboarding.steps.step1.titleHighlight"),
    description: t("onboarding.steps.step1.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: t("onboarding.steps.step2.title"),
    titleHighlight: t("onboarding.steps.step2.titleHighlight"),
    description: t("onboarding.steps.step2.description"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export default function EnhancedOnboardingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onboardingStepsObj = getOnboardingSteps(t);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingStepsObj.length - 1) {
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

  const currentStepData = onboardingStepsObj[currentStep];

  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-6xl flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("onboarding.error.title")}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              {t("onboarding.error.description")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("onboarding.welcome.title")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {user ? t("onboarding.welcome.subtitleHello", { name: user.name || user.preferred_username || "there" })
              : t("onboarding.welcome.subtitleGuest")}
          </p>
        </header>

        {/* Main onboarding card */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {t("onboarding.stepProgress", { current: currentStep + 1, total: onboardingStepsObj.length })}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("onboarding.stepDescription")}
                </p>
              </div>
              <div className="px-4 py-6 sm:px-6">
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
                    totalSteps={onboardingStepsObj.length}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                  />
                )}
              </div>
            </div>

            {!showCompletion && (
              <div className="flex items-center justify-center gap-2">
                {onboardingStepsObj.map((step, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${index === currentStep
                      ? step.color.replace("text-", "bg-")
                      : index < currentStep
                        ? "bg-emerald-500"
                        : "bg-muted"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Context panel */}
          <aside className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("onboarding.context.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.context.description")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {Array.isArray(t('onboarding.context.list', { returnObjects: true })) &&
                (t('onboarding.context.list', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}
