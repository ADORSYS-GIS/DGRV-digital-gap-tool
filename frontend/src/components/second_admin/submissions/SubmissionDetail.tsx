import { AssessmentSummary } from "@/types/assessment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { DimensionAssessmentDetail } from "./DimensionAssessmentDetail";
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart,
} from "lucide-react";

interface SubmissionDetailProps {
  summary: AssessmentSummary;
}

export const SubmissionDetail = ({ summary }: SubmissionDetailProps) => {
  const { data: dimensions } = useDimensions();

  const getDimensionName = (dimensionId: string) => {
    return (
      dimensions?.find((d) => d.id === dimensionId)?.name || "Unknown Dimension"
    );
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <FileText className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">
          {summary.assessment.document_title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-semibold text-gray-600 mr-2">
            Status:
          </span>
          <span className="font-medium">{summary.assessment.status}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm font-semibold text-gray-600 mr-2">
            Submitted At:
          </span>
          <span className="font-medium">
            {new Date(summary.assessment.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm font-semibold text-gray-600 mr-2">
            Gaps Count:
          </span>
          <span className="font-medium">{summary.gaps_count}</span>
        </div>
        <div className="flex items-center">
          <BarChart className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-sm font-semibold text-gray-600 mr-2">
            Recommendations Count:
          </span>
          <span className="font-medium">{summary.recommendations_count}</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
          Dimension Assessments
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {summary.dimension_assessments.map((da) => (
            <AccordionItem
              key={da.dimension_assessment_id}
              value={da.dimension_assessment_id}
              className="border-b-0"
            >
              <AccordionTrigger className="hover:bg-gray-100 p-4 rounded-lg">
                <span className="font-semibold text-lg text-gray-700">
                  {getDimensionName(da.dimension_id)}
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pl-10">
                <DimensionAssessmentDetail
                  dimensionId={da.dimension_id}
                  currentStateId={da.current_state_id}
                  desiredStateId={da.desired_state_id}
                  gapScore={da.gap_score}
                  gapId={da.gap_id}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
