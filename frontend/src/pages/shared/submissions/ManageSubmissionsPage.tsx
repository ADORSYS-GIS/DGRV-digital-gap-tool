import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { useLocation, useParams } from "react-router-dom";

export default function ManageSubmissionsPage() {
  const { user } = useAuth();
  const { assessmentId } = useParams<{ assessmentId?: string }>();
  const location = useLocation();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();

  // Debug logs (remove in production)
  console.log("User roles from token:", user?.roles);
  console.log("Organization ID:", organizationId);
  console.log("Cooperation ID:", cooperationId);
  console.log("Assessment ID:", assessmentId);

  // Normalize roles to lowercase for case-insensitive comparison
  const userRoles = (user?.roles || []).map((role) => role?.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());
  const isCoopUser =
    userRoles.includes(ROLES.COOP_USER.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  // Use the appropriate hook based on user role
  const {
    data: orgSubmissions = [],
    isLoading: isLoadingOrg,
    error: orgError,
    isFetching: isFetchingOrg,
    refetch: refetchOrgSubmissions,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: isOrgAdmin && !!organizationId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const {
    data: coopSubmissions = [],
    isLoading: isLoadingCoop,
    error: coopError,
    isFetching: isFetchingCoop,
    refetch: refetchCoopSubmissions,
  } = useSubmissionsByCooperation(cooperationId || "", {
    enabled: isCoopUser && !!cooperationId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Log submission data for debugging
  console.log("Organization Submissions:", orgSubmissions);
  console.log("Cooperation Submissions:", coopSubmissions);

  // Manually trigger refetch if needed
  const handleRefetch = () => {
    if (isOrgAdmin) {
      refetchOrgSubmissions();
    } else if (isCoopUser) {
      refetchCoopSubmissions();
    }
  };

  // Determine which data to use based on user role
  const submissions = isOrgAdmin
    ? orgSubmissions
    : isCoopUser
      ? coopSubmissions
      : [];
  const isLoading = isOrgAdmin
    ? isLoadingOrg
    : isCoopUser
      ? isLoadingCoop
      : false;
  const error = isOrgAdmin ? orgError : isCoopUser ? coopError : null;
  const isFetching = isOrgAdmin
    ? isFetchingOrg
    : isCoopUser
      ? isFetchingCoop
      : false;

  // Check if user has any valid role
  const hasValidRole = isOrgAdmin || isCoopUser;

  // If user doesn't have a valid role, show access denied
  if (!hasValidRole) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You don't have permission to view submissions. Please contact
                  your administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {assessmentId ? "Submission Details" : "My Submissions"}
        </h1>
        <p className="text-gray-600">
          {assessmentId
            ? "View and manage submission details"
            : "View and manage your submissions"}
        </p>
      </div>

      {/* Loading state */}
      {(isLoading || isFetching) && <LoadingSpinner />}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading submissions
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {error instanceof Error
                    ? error.message
                    : "An unknown error occurred"}
                </p>
                <button
                  onClick={handleRefetch}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions list */}
      {!isLoading && !error && submissions.length > 0 && (
        <div className="space-y-6">
          <SubmissionList
            submissions={submissions}
            basePath={location.pathname.split("/").slice(0, 2).join("/")}
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && submissions.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">
            {assessmentId
              ? "No submission found for this assessment."
              : isOrgAdmin
                ? "No submission found for this assessment in your organization."
                : isCoopUser
                  ? "No submission found for this assessment in your cooperation."
                  : "No submission found."}
          </p>
        </div>
      )}
    </div>
  );
}
