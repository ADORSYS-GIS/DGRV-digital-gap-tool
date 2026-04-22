import { authService } from "../shared/authService";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { cooperationSyncService } from "./cooperationSyncService";
import { digitalisationLevelSyncService } from "./digitalisationLevelSyncService";
import { organizationDimensionSyncService } from "./organizationDimensionSyncService";
import { dimensionSyncService } from "./dimensionSyncService";
import { digitalisationGapSyncService } from "./digitalisationGapSyncService";
import { recommendationSyncService } from "./recommendationSyncService";
import { userSyncService } from "./userSyncService";
import { assessmentSubmissionSyncService } from "./assessmentSubmissionSyncService";
import { dimensionAssessmentSyncService } from "./dimensionAssessmentSyncService";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

export const syncManager = {
  initialize() {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Perform initial sync and pre-cache if online
    if (navigator.onLine) {
      const organizationId = authService.getOrganizationId();
      this.syncAll(organizationId);
      this.precacheAll(organizationId);
    }
  },

  destroy() {
    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));
  },

  handleOnline() {
    console.log("Application is back online. Starting sync...");
    toast.info("Back online – syncing saved data…", { id: "sync-start", duration: 3000 });
    const organizationId = authService.getOrganizationId();
    syncManager.syncAll(organizationId).then(() => {
      toast.success("All data synced successfully.", { id: "sync-done", duration: 4000 });
    });
  },

  handleOffline() {
    console.log("Application is offline.");
    toast.warning("You are offline. Your work will be saved locally and synced when you reconnect.", {
      id: "offline-notice",
      duration: 6000,
    });
  },

  async syncAll(organizationId: string | null) {
    if (!navigator.onLine) {
      console.log("No internet connection — skipping syncAll.");
      return;
    }
    try {
      await dimensionSyncService.sync();
      await digitalisationLevelSyncService.sync();
      await digitalisationGapSyncService.sync();
      await recommendationSyncService.sync();
      await userSyncService.sync();

      // Sync individual dimension answers BEFORE the final assessment submission
      await dimensionAssessmentSyncService.sync();

      if (organizationId) {
        await cooperationSyncService.sync(organizationId);
        await organizationDimensionSyncService.syncPendingAssignments();
        await cooperationUserSyncService.sync();
      }
      // Flush any pending full-assessment submissions
      await assessmentSubmissionSyncService.sync();

      console.log("All data synced successfully.");
    } catch (error) {
      console.error("An error occurred during sync:", error);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["digitalisationLevels"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    }
  },

  async precacheAll(organizationId: string | null) {
    if (!navigator.onLine) return;

    try {
      console.log("Starting proactive pre-caching...");

      const { assessmentRepository } = await import("../assessments/assessmentRepository");
      const { submissionRepository } = await import("../assessments/submissionRepository");
      const { organizationRepository } = await import("../organizations/organizationRepository");
      const { userRepository } = await import("../users/userRepository");
      const { actionPlanRepository } = await import("../action_plans/actionPlanRepository");
      const { cooperationRepository } = await import("../cooperations/cooperationRepository");
      const { listAssessmentsByOrganization, listAssessmentsByCooperation } = await import("@/openapi-client");

      // Always pre-cache organization list (needed by all roles)
      await organizationRepository.getAll();

      if (organizationId) {
        // Pre-cache assessments for this organization
        const assessments = await assessmentRepository.syncAssessments(
          async () => {
            const resp = await listAssessmentsByOrganization({ organizationId });
            return { data: { assessments: resp.data?.assessments ?? [] } };
          },
          "organization_id",
          organizationId
        );

        await submissionRepository.listByOrganization(organizationId);
        await userRepository.getMembers(organizationId);
        // Pre-cache cooperations for this organization
        await cooperationRepository.getAll(organizationId);

        if (assessments && assessments.length > 0) {
          Promise.all(
            assessments.map(async (a) => {
              await assessmentRepository.getById(a.id);
              await actionPlanRepository.getActionPlanByAssessmentId(a.id);
              // Pre-cache dimension states in all supported languages
              if (a.dimensionIds?.length) {
                const { dimensionAssessmentRepository } = await import("../assessments/dimensionAssessmentRepository");
                for (const lang of ['en', 'fr', 'pt', 'ss']) {
                  await Promise.all(
                    a.dimensionIds.map((dimId: string) =>
                      dimensionAssessmentRepository.getDimensionWithStates(dimId, lang)
                        .catch(() => {/* ignore per-lang failures */})
                    )
                  );
                }
              }
            })
          ).catch(err => console.error("Error during deep pre-caching:", err));
        }
      }

      // Pre-cache cooperation data for coop_admin, coop_user, second_admin, third_admin
      const userProfile = authService.getUserProfile();
      const roles = (userProfile?.roles || []).map(r => r.toLowerCase());
      const isCoopRelated = roles.some(r =>
        r.includes("coop_admin") || r.includes("coop_user") ||
        r.includes("second_admin") || r.includes("third_admin")
      );

      if (isCoopRelated) {
        // For coop roles the cooperation ID lives in the organization field
        const cooperationId = userProfile?.organization;
        if (cooperationId) {
          const coopAssessments = await assessmentRepository.syncAssessments(
            async () => {
              const resp = await listAssessmentsByCooperation({ cooperationId });
              return { data: { assessments: resp.data?.assessments ?? [] } };
            },
            "cooperation_id",
            cooperationId
          );
          await submissionRepository.listByCooperation(cooperationId);

          if (coopAssessments && coopAssessments.length > 0) {
            Promise.all(
              coopAssessments.map(async (a) => {
                await assessmentRepository.getById(a.id);
                await actionPlanRepository.getActionPlanByAssessmentId(a.id);
                // Pre-cache dimension states in all supported languages
                if (a.dimensionIds?.length) {
                  const { dimensionAssessmentRepository } = await import("../assessments/dimensionAssessmentRepository");
                  for (const lang of ['en', 'fr', 'pt', 'ss']) {
                    await Promise.all(
                      a.dimensionIds.map((dimId: string) =>
                        dimensionAssessmentRepository.getDimensionWithStates(dimId, lang)
                          .catch(() => {/* ignore per-lang failures */})
                      )
                    );
                  }
                }
              })
            ).catch(err => console.error("Error during deep pre-caching (coop):", err));
          }
        }
      }

      console.log("Proactive pre-caching completed.");
    } catch (error) {
      console.error("Proactive pre-caching failed:", error);
    }
  },
};
