import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddAssessmentForm } from "@/components/shared/assessments/AddAssessmentForm";
import { NoDimensionsModal } from "@/components/shared/assessments/NoDimensionsModal";
import { AssessmentList } from "@/components/shared/assessments/AssessmentList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAssessmentsByOrganization } from "@/hooks/assessments/useAssessmentsByOrganization";
import { useAssessmentsByCooperation } from "@/hooks/assessments/useAssessmentsByCooperation";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { toast } from "sonner";
import { SyncStatus } from "@/types/sync";

/**
 * Unified management screen for draft assessments.
 * Org admins see assessments across cooperations; coop users see only their own.
 */
export default function ManageAssessments() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isNoDimensionsModalOpen, setNoDimensionsModalOpen] = useState(false);
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();
  const {
    cooperationId: cooperationIdFromPath,
    cooperationPath,
    isLoading: isLoadingCoopIdFromPath,
    error: coopIdFromPathError,
  } = useCooperationIdFromPath();

  // Prefer a route param if present; otherwise fall back to the token-derived ID
  const effectiveCooperationId = cooperationId || cooperationIdFromPath;

  // Normalize roles to lowercase for case-insensitive comparison
  const userRoles = (user?.roles || []).map((role) => role.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());

  const { data: assignedDimensionIds, isLoading: isLoadingDimensions } =
    useOrganizationDimensions(organizationId || "");

  const { data: cooperations } = useCooperations(organizationId || undefined);

  const cooperationsById = useMemo(() => {
    const map: Record<string, string> = {};
    cooperations?.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [cooperations]);

  const handleAddAssessmentClick = () => {
    if (
      isOrgAdmin &&
      (!assignedDimensionIds || assignedDimensionIds.length === 0)
    ) {
      setNoDimensionsModalOpen(true);
      return;
    }

    if (!cooperations || cooperations.length === 0) {
      toast.error("No Cooperations Available", {
        description:
          "Please create a cooperation before creating an assessment.",
      });
      return;
    }

    setAddDialogOpen(true);
  };

  // Debug logs
  console.log("User roles from token:", user?.roles);
  console.log("Organization ID:", organizationId);
  console.log("Cooperation ID (route):", cooperationId);
  console.log("Cooperation path (token):", cooperationPath);
  console.log("Cooperation ID (from path):", cooperationIdFromPath);
  console.log("Effective cooperation ID:", effectiveCooperationId);
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
    status: ["draft"], // Only fetch draft assessments
  });

  const {
    data: coopAssessments,
    isLoading: isLoadingCoop,
    error: coopError,
    isFetching: isFetchingCoop,
  } = useAssessmentsByCooperation(effectiveCooperationId || "", {
    enabled: isCoopUser && !!effectiveCooperationId, // Only fetch for coop users with a cooperation ID
    status: ["draft"], // Only fetch draft assessments
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
      cooperationId: effectiveCooperationId,
      isFetching: isFetchingCoop,
      data: coopAssessments,
      error: coopError,
    });
  }, [
    isCoopUser,
    effectiveCooperationId,
    isFetchingCoop,
    coopAssessments,
    coopError,
  ]);

  // Determine which data to use based on user role
  const syncedCoopAssessments =
    coopAssessments?.filter(
      (assessment) => assessment.syncStatus === SyncStatus.SYNCED,
    ) || [];
  const assessments = isOrgAdmin ? orgAssessments : syncedCoopAssessments;
  const isLoading = isLoadingOrg || isLoadingCoop || isLoadingCoopIdFromPath;
  const error = orgError || coopError || coopIdFromPathError;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Manage assessments
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Create and track draft assessments across your cooperations before
              they are sent out for completion.
            </p>
          </div>
          {isOrgAdmin && (
            <Button
              onClick={handleAddAssessmentClick}
              disabled={isLoadingDimensions}
              className="gap-2 rounded-full shadow-sm transition-all hover:shadow-md"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span>Create assessment</span>
            </Button>
          )}
        </header>

        {isLoading && (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Unable to load draft assessments.</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && isCoopUser && !effectiveCooperationId && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">No cooperation determined.</p>
            <p className="mt-1 opacity-90">
              We could not resolve your cooperation from the route or token.
              Please contact your administrator.
            </p>
          </div>
        )}

        {!isLoading && !error && assessments && assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No draft assessments yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Draft assessments will appear here once you start planning new
              evaluations for your cooperations.
            </p>
            {isOrgAdmin && (
              <div className="mt-4">
                <Button
                  onClick={handleAddAssessmentClick}
                  disabled={isLoadingDimensions}
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Create assessment</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && assessments && assessments.length > 0 && (
          <section
            aria-label="Draft assessments list"
            className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <AssessmentList
              assessments={assessments}
              userRoles={userRoles}
              cooperationsById={cooperationsById}
            />
          </section>
        )}

        <AddAssessmentForm
          isOpen={isAddDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
        <NoDimensionsModal
          isOpen={isNoDimensionsModalOpen}
          onClose={() => setNoDimensionsModalOpen(false)}
        />
      </div>
    </div>
  );
}
