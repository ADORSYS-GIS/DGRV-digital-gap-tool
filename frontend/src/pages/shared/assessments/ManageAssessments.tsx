import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddAssessmentForm } from "@/components/shared/assessments/AddAssessmentForm";
import { AssessmentList } from "@/components/shared/assessments/AssessmentList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAssessmentsByOrganization } from "@/hooks/assessments/useAssessmentsByOrganization";
import { useAssessmentsByCooperation } from "@/hooks/assessments/useAssessmentsByCooperation";
import { useAuth } from "@/hooks/shared/useAuth";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";

export default function ManageAssessments() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();

  // Debug logs
  console.log("User roles from token:", user?.roles);
  console.log("Organization ID:", organizationId);
  console.log("Cooperation ID:", cooperationId);

  // Normalize roles to lowercase for case-insensitive comparison
  const userRoles = (user?.roles || []).map((role) => role.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());
  const isCoopUser =
    userRoles.includes(ROLES.COOP_USER.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  console.log("isOrgAdmin:", isOrgAdmin, "isCoopUser:", isCoopUser);

  // Use the appropriate hook based on user role
  const {
    data: orgAssessments,
    isLoading: isLoadingOrg,
    error: orgError,
  } = useAssessmentsByOrganization(organizationId || "", {
    enabled: isOrgAdmin && !!organizationId, // Only fetch for org admins with an organization ID
  });

  const {
    data: coopAssessments,
    isLoading: isLoadingCoop,
    error: coopError,
    isFetching: isFetchingCoop,
  } = useAssessmentsByCooperation(cooperationId || "", {
    enabled: isCoopUser && !!cooperationId, // Only fetch for coop users with a cooperation ID
  });

  // Log when the query is settled
  useEffect(() => {
    if (!isLoadingCoop) {
      console.log("useAssessmentsByCooperation settled:", {
        data: coopAssessments,
        error: coopError,
      });
    }
  }, [isLoadingCoop, coopAssessments, coopError]);

  // Debug effect to log hook states
  useEffect(() => {
    console.log("useAssessmentsByCooperation state:", {
      isCoopUser,
      cooperationId,
      isFetching: isFetchingCoop,
      data: coopAssessments,
      error: coopError,
    });
  }, [isCoopUser, cooperationId, isFetchingCoop, coopAssessments, coopError]);

  // Determine which data to use based on user role
  const assessments = isOrgAdmin ? orgAssessments : coopAssessments;
  const isLoading = isLoadingOrg || isLoadingCoop;
  const error = orgError || coopError;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Assessments
        </h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {assessments && <AssessmentList assessments={assessments} />}

      <AddAssessmentForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
