import { DimensionCard } from "@/components/shared/DimensionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimension } from "@/types/dimension";
import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSubmitAssessment } from "@/hooks/submissions/useSubmitAssessment";
import { useCooperationUsersForAdmin } from "@/hooks/cooperationUsers/useCooperationUsersForAdmin";
import { ROLES } from "@/constants/roles";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

const AssessmentDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language ?? 'en').split('-')[0];
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { mutateAsync: submitAssessment } = useSubmitAssessment();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Fetch assessment
  const { data: assessment, isLoading: isLoadingAssessment, error: assessmentError } = useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const result = await assessmentRepository.getById(assessmentId!);
      return result ?? null;
    },
    enabled: !!assessmentId,
  });

  // Fetch dimensions resolved to current language
  const { data: dimensions = [], isLoading: isLoadingDimensions } = useQuery({
    queryKey: ["assessmentDimensions", assessmentId, lang],
    queryFn: async () => {
      if (!assessment?.dimensionIds?.length) return [];
      const allDims = await dimensionRepository.getAll("all");
      return assessment.dimensionIds.map((storedId: string) => {
        const matchById = allDims.find((d) => d.id === storedId);
        const dimKey = matchById ? ((matchById as any).dimension_key ?? storedId) : storedId;
        const targetRow = allDims.find(
          (d) => ((d as any).dimension_key ?? d.id) === dimKey && (d as any).language === lang,
        );
        const englishRow = allDims.find(
          (d) => ((d as any).dimension_key ?? d.id) === dimKey && (d as any).language === "en",
        );
        return (targetRow ?? englishRow ?? matchById) as IDimension;
      }).filter(Boolean) as IDimension[];
    },
    enabled: !!assessment?.dimensionIds?.length,
    staleTime: 0,
  });

  const loading = isLoadingAssessment || isLoadingDimensions;
  const error = assessmentError ? t("sharedAssessments.detail.failedToFetch") : null;

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);

  const userRoles = useMemo(() => user?.roles || [], [user?.roles]);
  const isCoopAdmin = useMemo(
    () => userRoles.map((r) => r.toLowerCase()).includes(ROLES.COOP_ADMIN),
    [userRoles],
  );
  const isCoopUserRestricted = useMemo(
    () =>
      userRoles.map((r) => r.toLowerCase()).includes("coop_user") &&
      !isCoopAdmin,
    [userRoles, isCoopAdmin],
  );
  const assignedDimensionIds = useMemo(
    () => user?.assigned_dimensions || [],
    [user?.assigned_dimensions],
  );

  // For coop_admin: collect all dimension IDs assigned to any coop_user in this cooperative
  const { data: cooperationUsers = [] } = useCooperationUsersForAdmin();
  const dimensionsAssignedToUsers = useMemo(() => {
    if (!isCoopAdmin) return new Set<string>();
    const ids = new Set<string>();
    cooperationUsers.forEach((u) => {
      if (u.roles.includes(ROLES.COOP_USER)) {
        (u.dimensionIds || []).forEach((id) => ids.add(id));
      }
    });
    return ids;
  }, [isCoopAdmin, cooperationUsers]);

  const filteredDimensions = useMemo(() => {
    if (!isCoopUserRestricted) return dimensions;
    if (!assignedDimensionIds.length) return [];
    // assignedDimensionIds are dimension_key values — match against dimension_key
    return dimensions.filter((d) =>
      assignedDimensionIds.includes((d as any).dimension_key ?? d.id)
    );
  }, [dimensions, assignedDimensionIds, isCoopUserRestricted]);

  const submittedDimensionIds = useMemo(() => {
    // Build a set of dimension_key values that have been submitted
    return new Set(
      (dimensionAssessments || [])
        .filter((da) =>
          !isCoopUserRestricted
            ? true
            : assignedDimensionIds.includes(da.dimensionId),
        )
        .map((da) => {
          // Find the dimension_key for this dimensionId
          const dim = dimensions.find((d) => d.id === da.dimensionId);
          return dim ? ((dim as any).dimension_key ?? da.dimensionId) : da.dimensionId;
        }),
    );
  }, [dimensionAssessments, assignedDimensionIds, isCoopUserRestricted, dimensions]);

  const completedPerspectives = submittedDimensionIds.size;

  const handleStartDimensionAssessment = (dimensionId: string) => {
    if (assessmentId) {
      const basePath = location.pathname.split("/")[1];
      // Always navigate using dimension_key (stable cross-language identifier)
      // so the answering page can resolve the correct language version
      const dim = dimensions.find((d) => d.id === dimensionId);
      const stableId = dim ? ((dim as any).dimension_key ?? dimensionId) : dimensionId;
      navigate(
        `/${basePath}/assessment/${assessmentId}/dimension/${stableId}`,
      );
    } else {
      toast.error(t("sharedAssessments.detail.assessmentIdNotFound"));
    }
  };

  const handleSubmit = async () => {
    if (assessmentId) {
      try {
        await submitAssessment(assessmentId);
        toast.success(t("sharedAssessments.detail.submitSuccess"));
        const basePath = location.pathname.split("/")[1];
        navigate(`/${basePath}/assessments`);
      } catch (error) {
        toast.error(t("sharedAssessments.detail.submitError"));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("sharedAssessments.detail.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          <p className="font-semibold">{t("sharedAssessments.detail.unableToLoad")}</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-muted-foreground/30 bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
          {t("sharedAssessments.detail.assessmentNotFound")}
        </div>
      </div>
    );
  }

  const progressPercentage =
    filteredDimensions.length > 0
      ? (completedPerspectives / filteredDimensions.length) * 100
      : 0;

  return (
    <div className="overflow-y-auto h-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress header */}
        <section className="mb-8 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:px-6 sm:py-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {t("sharedAssessments.detail.digitalGapAssessment")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("sharedAssessments.detail.subtitle")}
              </p>
            </div>
            <div className="w-full max-w-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{t("sharedAssessments.detail.yourProgress")}</span>
                <span>
                  {t("sharedAssessments.detail.progressOf", {
                    current: completedPerspectives,
                    total: filteredDimensions.length,
                  })}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-right text-xs font-semibold text-muted-foreground">
                {Math.round(progressPercentage)}%
              </p>
            </div>
          </div>
        </section>

        {/* Intro copy */}
        <section className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("sharedAssessments.detail.welcome")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("sharedAssessments.detail.intro", {
              count: filteredDimensions.length,
            })}
          </p>
        </section>

        {/* Dimensions grid */}
        <section aria-label="Assessment dimensions">
          {filteredDimensions.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
              {isCoopUserRestricted
                ? t("sharedAssessments.detail.noDimensionsAssigned")
                : t("sharedAssessments.detail.noDimensionsConfigured")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDimensions.map((dimension) => (
                <DimensionCard
                  key={dimension.id}
                  dimension={dimension}
                  onClick={handleStartDimensionAssessment}
                  isSubmitted={submittedDimensionIds.has((dimension as any).dimension_key ?? dimension.id)}
                  isLocked={isCoopAdmin && dimensionsAssignedToUsers.has(dimension.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Finish Assessment Button */}
        {!isCoopUserRestricted && (
          <section className="mt-10 text-center">
            <Button
              size="lg"
              disabled={progressPercentage < 100}
              onClick={handleSubmit}
            >
              {t("sharedAssessments.detail.finishAssessment")}
            </Button>
          </section>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
