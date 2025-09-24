import { ArrowLeft, ArrowRight, CheckCircle, LucideProps } from "lucide-react";

interface OnboardingStepProps {
  step: {
    icon: React.ComponentType<LucideProps>;
    title: string;
    titleHighlight: string;
    description: string;
    color: string;
  };
  isTransitioning: boolean;
  currentStep: number;
  totalSteps: number;
  handlePrevious: () => void;
  handleNext: () => void;
}

export default function OnboardingStep({
  step,
  isTransitioning,
  currentStep,
  totalSteps,
  handlePrevious,
  handleNext,
}: OnboardingStepProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl p-12 transition-all duration-500 ease-in-out ${
        isTransitioning
          ? "opacity-0 scale-95 translate-x-8"
          : "opacity-100 scale-100 translate-x-0"
      }`}
    >
      <div className="flex justify-center mb-16">
        <step.icon className={`h-28 w-28 ${step.color}`} strokeWidth={1} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-medium text-gray-800 leading-tight">
          {step.title}{" "}
          <span className="text-blue-600 font-medium">
            {step.titleHighlight}
          </span>
        </h2>
      </div>

      <p className="text-base text-gray-600 text-center mb-16 leading-relaxed max-w-md mx-auto">
        {step.description}
      </p>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentStep === 0
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-white bg-gray-600 hover:bg-gray-700"
          }`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center group"
        >
          {currentStep === totalSteps - 1 ? (
            <>
              Finish
              <CheckCircle className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
