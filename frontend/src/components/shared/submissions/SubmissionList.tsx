import { Assessment } from "@/types/assessment";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";

interface SubmissionListProps {
  submissions: Assessment[];
  limit?: number;
  basePath: string;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "reviewed":
      return "success";
    case "under review":
      return "warning";
    default:
      return "secondary";
  }
};

export const SubmissionList = ({
  submissions,
  limit,
  basePath,
}: SubmissionListProps) => {
  const items = limit ? submissions.slice(0, limit) : submissions;

  return (
    <div className="space-y-3">
      {items.map((submission) => (
        <Link
          to={`/${basePath}/submissions/${submission.id}`}
          key={submission.id}
          className="block"
        >
          <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {submission.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant={getStatusVariant(submission.status)}>
              {submission.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
};
