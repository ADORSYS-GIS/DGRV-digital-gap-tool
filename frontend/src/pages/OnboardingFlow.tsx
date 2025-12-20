import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, LucideProps } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
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

  const currentStepData = onboardingSteps[currentStep];

  if (!currentStepData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-6xl flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Something went wrong
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              We could not load your onboarding steps. Please refresh the page
              or try again later.
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
            Welcome to your digitalization journey
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {user ? (
              <>
                Hello{" "}
                <span className="font-medium text-foreground">
                  {user.name || user.preferred_username || "there"}
                </span>
                . Follow these quick steps to understand your current
                digitalization level, define your goals, and get tailored
                recommendations.
              </>
            ) : (
              <>
                Follow these quick steps to understand your current
                digitalization level, define your goals, and get tailored
                recommendations.
              </>
            )}
          </p>
        </header>

        {/* Main onboarding card */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete each step to unlock personalized insights for your
                  cooperative.
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
                    totalSteps={onboardingSteps.length}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                  />
                )}
              </div>
            </div>

            {!showCompletion && (
              <div className="flex items-center justify-center gap-2">
                {onboardingSteps.map((step, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                      index === currentStep
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
              What you can expect
            </h2>
            <p className="text-sm text-muted-foreground">
              This onboarding takes just a few moments and helps us tailor the
              digital gap assessment experience to your cooperative&apos;s
              needs.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                Understand your current digitalization level.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                Define your desired future state and priorities.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                Receive data-driven recommendations and next steps.
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}
