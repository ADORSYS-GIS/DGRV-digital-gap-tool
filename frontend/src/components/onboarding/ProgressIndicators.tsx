interface ProgressIndicatorsProps {
  totalSteps: number;
  currentStep: number;
  isCompleted: boolean;
}

export default function ProgressIndicators({
  totalSteps,
  currentStep,
  isCompleted,
}: ProgressIndicatorsProps) {
  return (
    <div className="flex justify-center mb-12">
      {[...Array(totalSteps + 1)].map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full mx-1.5 transition-all duration-500 ${
            isCompleted
              ? index === totalSteps
                ? "bg-green-500 w-8"
                : "bg-green-500 w-2"
              : index === currentStep
                ? "bg-blue-600 w-8"
                : index < currentStep
                  ? "bg-green-500 w-2"
                  : "bg-gray-300 w-2"
          }`}
        />
      ))}
    </div>
  );
}
