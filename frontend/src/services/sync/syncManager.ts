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

      // We import these on demand to avoid potential circular dependencies or early loading issues
      const { assessmentRepository } = await import("../assessments/assessmentRepository");
      const { submissionRepository } = await import("../assessments/submissionRepository");
      const { organizationRepository } = await import("../organizations/organizationRepository");
      const { userRepository } = await import("../users/userRepository");
      const { actionPlanRepository } = await import("../action_plans/actionPlanRepository");
      const { listAssessmentsByOrganization, listAssessmentsByCooperation } = await import("@/openapi-client");

      // 1. Pre-cache organization list
      await organizationRepository.getAll();

      if (organizationId) {
        // 2. Pre-cache assessments list for the organization
        const assessments = await assessmentRepository.syncAssessments(
          async () => {
            const resp = await listAssessmentsByOrganization({ organizationId });
            return { data: { assessments: resp.data?.assessments ?? [] } };
          },
          "organization_id",
          organizationId
        );

        // 3. Pre-cache submissions list for the organization
        await submissionRepository.listByOrganization(organizationId);

        // 4. Pre-cache users list
        await userRepository.getMembers(organizationId);

        // 5. Deep pre-cache for each assessment (Dimensions + Action Plans)
        // We do this in parallel but limit it to avoid overwhelming the browser/network
        if (assessments && assessments.length > 0) {
          Promise.all(
            assessments.map(async (a) => {
              // getById triggers dimension pre-caching internally
              await assessmentRepository.getById(a.id);
              // also pre-cache action plan
              await actionPlanRepository.getActionPlanByAssessmentId(a.id);
            })
          ).catch(err => console.error("Error during deep pre-caching:", err));
        }
      }

      // 6. Also try to pre-cache cooperation data if applicable
      const userProfile = authService.getUserProfile();
      const isCoopUser = userProfile?.roles?.some(r =>
        r.toLowerCase().includes("coop_admin") || r.toLowerCase().includes("coop_user")
      );

      if (isCoopUser) {
        const cooperationId = userProfile?.organization; // In this app, organization field often holds coop ID for coop users
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

          // Deep pre-cache for cooperation assessments
          if (coopAssessments && coopAssessments.length > 0) {
            Promise.all(
              coopAssessments.map(async (a) => {
                await assessmentRepository.getById(a.id);
                await actionPlanRepository.getActionPlanByAssessmentId(a.id);
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
