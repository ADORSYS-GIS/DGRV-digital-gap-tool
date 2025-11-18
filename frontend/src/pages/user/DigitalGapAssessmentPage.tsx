import React, { useState } from "react";
import PerspectiveSection from "@/components/user/PerspectiveSection";
import GapVisualization from "@/components/user/GapVisualization";
import { Button } from "@/components/ui/button";
import { useSubmitAssessment } from "@/hooks/assessments/useSubmitAssessment";
import { AssessmentInput, GapResult } from "@/types/assessment";
import { Loader2 } from "lucide-react"; // For loading spinner

const perspectivesData = [
  {
    title: "Strategy & Leadership",
    description:
      "Assesses the clarity of digital strategy and leadership's commitment to digitalization.",
  },
  {
    title: "Processes & Operations",
    description:
      "Evaluates the digitalization of core business processes and operational efficiency.",
  },
  {
    title: "Customer & Market",
    description:
      "Examines digital channels for customer engagement, market reach, and service delivery.",
  },
  {
    title: "Technology & Infrastructure",
    description:
      "Reviews the current IT infrastructure, systems, and technological capabilities.",
  },
  {
    title: "Data & Analytics",
    description:
      "Focuses on data collection, analysis, and utilization for decision-making.",
  },
  {
    title: "Workforce & Culture",
    description:
      "Assesses the digital skills of the workforce and the organizational culture's adaptability to digital change.",
  },
  {
    title: "Innovation & Ecosystem",
    description:
      "Looks at the organization's capacity for digital innovation and collaboration within its ecosystem.",
  },
  {
    title: "Security & Compliance",
    description:
      "Evaluates the measures in place for digital security, data protection, and regulatory compliance.",
  },
];

const DigitalGapAssessmentPage: React.FC = () => {
  const [assessmentInputs, setAssessmentInputs] = useState<AssessmentInput[]>(
    perspectivesData.map((p) => ({
      perspective: p.title,
      currentLevel: "",
      toBeLevel: "",
      comment: "",
    })),
  );
  const [results, setResults] = useState<GapResult[] | null>(null);
  const { mutate: submitForm, isPending, isSuccess } = useSubmitAssessment();

  const handlePerspectiveValueChange = (
    perspectiveTitle: string,
    current: string,
    tobe: string,
    comment: string,
  ) => {
    setAssessmentInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.perspective === perspectiveTitle
          ? {
              ...input,
              currentLevel: current,
              toBeLevel: tobe,
              comment: comment,
            }
          : input,
      ),
    );
  };

  const handleSubmit = () => {
    submitForm(assessmentInputs, {
      onSuccess: (responseData) => {
        setResults(responseData.results);
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Digital Gap Assessment</h1>
      <p className="text-lg mb-8">
        As a cooperative manager, assess your organization’s current and future
        digitalization level to identify gaps and take action.
      </p>

      {!isSuccess ? (
        <div className="space-y-8">
          {perspectivesData.map((p, index) => (
            <PerspectiveSection
              key={index}
              title={p.title}
              description={p.description}
              onValueChange={handlePerspectiveValueChange}
              initialCurrent={assessmentInputs[index]?.currentLevel}
              initialToBe={assessmentInputs[index]?.toBeLevel}
              initialComment={assessmentInputs[index]?.comment}
            />
          ))}
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Assessment
          </Button>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          <h2 className="text-2xl font-bold">Assessment Results</h2>
          {results?.map((result, index) => (
            <GapVisualization
              key={index}
              perspective={result.perspective}
              gapSeverity={result.gapSeverity}
              recommendations={result.recommendations}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalGapAssessmentPage;
