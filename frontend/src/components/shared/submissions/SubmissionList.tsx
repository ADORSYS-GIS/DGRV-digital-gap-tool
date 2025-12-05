import { AssessmentSummary } from "@/types/assessment";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";

interface SubmissionListProps {
  submissions: AssessmentSummary[];
  limit?: number;
  basePath: string;
  showOrganization?: boolean;
  onSubmissionSelect?: (submission: AssessmentSummary) => void;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "reviewed":
      return "success";
    case "under review":
      return "warning";
    case "draft":
      return "outline";
    case "completed":
      return "default";
    default:
      return "secondary";
  }
};

interface SubmissionItemData {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  status: string;
  overall_score: number | null;
  gaps_count: number;
}

export const SubmissionList = ({
  submissions,
  limit,
  basePath,
  showOrganization = false,
  onSubmissionSelect,
}: SubmissionListProps) => {
  const items = limit ? submissions.slice(0, limit) : submissions;

  const handleSubmissionClick = (submission: AssessmentSummary) => {
    if (onSubmissionSelect) {
      onSubmissionSelect(submission);
    }
  };

  // Transform AssessmentSummary to the format expected by the list item
  const getSubmissionData = (
    submission: AssessmentSummary,
  ): SubmissionItemData | null => {
    if (!submission || !submission.assessment) {
      console.warn("Invalid submission data:", submission);
      return null;
    }

    return {
      id: submission.assessment.assessment_id || "unknown-id",
      name: submission.assessment.document_title || "Unnamed Assessment",
      organization_id: submission.assessment.organization_id || "",
      created_at: submission.assessment.created_at || new Date().toISOString(),
      status: submission.assessment.status || "draft",
      overall_score: submission.overall_score ?? null,
      gaps_count: submission.gaps_count ?? 0,
    };
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No submissions found</p>
      </div>
    );
  }

  // Filter out any invalid submissions
  const validItems = items
    .map((submission) => ({
      submission,
      data: getSubmissionData(submission),
    }))
    .filter((item) => item.data !== null) as Array<{
    submission: AssessmentSummary;
    data: SubmissionItemData;
  }>;

  if (validItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No valid submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validItems.map(({ submission, data: submissionData }) =>
        onSubmissionSelect ? (
          <button
            key={submissionData.id}
            onClick={() => handleSubmissionClick(submission)}
            className="w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-50 rounded-full mt-1">
                  <Leaf className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 hover:underline">
                      {submissionData.name}
                    </h3>
                    <Badge
                      variant={getStatusVariant(submissionData.status)}
                      className="text-xs"
                    >
                      {submissionData.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Submitted on{" "}
                    {new Date(submissionData.created_at).toLocaleDateString()}
                  </p>

                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    {submissionData.overall_score !== null && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700">
                          {submissionData.overall_score.toFixed(1)}%
                        </span>
                        <span className="ml-1 text-gray-500">
                          overall score
                        </span>
                      </div>
                    )}

                    {submissionData.gaps_count > 0 && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700">
                          {submissionData.gaps_count}
                        </span>
                        <span className="ml-1 text-gray-500">
                          gap{submissionData.gaps_count !== 1 ? "s" : ""}{" "}
                          identified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 self-start">
                View details →
              </div>
            </div>
          </button>
        ) : (
          <div
            key={submissionData.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <Link
              to={`${basePath}/submissions/${submissionData.id}`}
              className="block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-full mt-1">
                    <Leaf className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 hover:underline">
                        {submissionData.name}
                      </h3>
                      <Badge
                        variant={getStatusVariant(submissionData.status)}
                        className="text-xs"
                      >
                        {submissionData.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Submitted on{" "}
                      {new Date(submissionData.created_at).toLocaleDateString()}
                    </p>

                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      {submissionData.overall_score !== null && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">
                            {submissionData.overall_score.toFixed(1)}%
                          </span>
                          <span className="ml-1 text-gray-500">
                            overall score
                          </span>
                        </div>
                      )}

                      {submissionData.gaps_count > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">
                            {submissionData.gaps_count}
                          </span>
                          <span className="ml-1 text-gray-500">
                            gap{submissionData.gaps_count !== 1 ? "s" : ""}{" "}
                            identified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500 self-start">
                  View details →
                </div>
              </div>
            </Link>
          </div>
        ),
      )}
    </div>
  );
};
