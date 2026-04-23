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

      // Explicitly trigger a full metadata refresh for gaps if online
      // This ensures the local gap cache is populated even if pre-caching was skipped.
      const { digitalisationGapRepository } = await import("../digitalisationGaps/digitalisationGapRepository");
      const langs = ["en", "fr", "pt", "ss"];
      for (const lang of langs) {
        await digitalisationGapRepository.getAll(lang).catch(() => { });
      }

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

      // --- 1. Common Metadata Sync (Shared by all flows) ---
      const { digitalisationGapRepository } = await import("../digitalisationGaps/digitalisationGapRepository");
      const { recommendationRepository } = await import("../recommendations/recommendationRepository");
      const langs = ["en", "fr", "pt", "ss"];

      for (const lang of langs) {
        await digitalisationGapRepository.getAll(lang).catch(() => { });
        await recommendationRepository.getAll(lang).catch(() => { });
      }

      const uniqueDimensionIds = new Set<string>();

      // --- 2. Organization Assessment Processing ---
      if (organizationId) {
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
        await cooperationRepository.getAll(organizationId);

        const { consolidatedReportRepository } = await import("../consolidated_reports/consolidatedReportRepository");
        const userProfile = authService.getUserProfile();
        const roles = (userProfile?.roles || []).map(r => r.toLowerCase());

        if (roles.includes("admin")) {
          await consolidatedReportRepository.getDgrvAdminConsolidatedReport();
        }
        if (roles.includes("org_admin") || roles.includes("second_admin")) {
          await consolidatedReportRepository.getOrgAdminConsolidatedReport(organizationId);
        }

        if (assessments && assessments.length > 0) {
          await Promise.all(
            assessments.map(async (a) => {
              await assessmentRepository.getById(a.id);
              await actionPlanRepository.getActionPlanByAssessmentId(a.id);
              if (a.dimensionIds?.length) {
                a.dimensionIds.forEach(id => uniqueDimensionIds.add(id));
              }
            })
          );
        }
      }

      // --- 3. Cooperation Assessment Processing ---
      const userProfile = authService.getUserProfile();
      const roles = (userProfile?.roles || []).map(r => r.toLowerCase());
      const isCoopRelated = roles.some(r =>
        r.includes("coop_admin") || r.includes("coop_user") ||
        r.includes("second_admin") || r.includes("third_admin")
      );

      if (isCoopRelated) {
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
            await Promise.all(
              coopAssessments.map(async (a) => {
                await assessmentRepository.getById(a.id);
                await actionPlanRepository.getActionPlanByAssessmentId(a.id);
                if (a.dimensionIds?.length) {
                  a.dimensionIds.forEach(id => uniqueDimensionIds.add(id));
                }
              })
            );
          }
        }
      }

      // --- 4. Unique Dimension State & Metadata Cache (Enrichment) ---
      if (uniqueDimensionIds.size > 0) {
        const { dimensionAssessmentRepository } = await import("../assessments/dimensionAssessmentRepository");
        const { dimensionRepository } = await import("../dimensions/dimensionRepository");
        const dimIdsArray = Array.from(uniqueDimensionIds);

        // Fetch FULL dimension objects to ensure dimension_key is cached
        await Promise.all(
          dimIdsArray.map((dimId) => dimensionRepository.getById(dimId).catch(() => { }))
        );

        for (const lang of [...langs, "all"]) {
          await Promise.all(
            dimIdsArray.map((dimId) =>
              dimensionAssessmentRepository
                .getDimensionWithStates(dimId, lang)
                .catch(() => { })
            )
          );
        }
      }

      console.log("Proactive pre-caching completed.");
    } catch (error) {
      console.error("Proactive pre-caching failed:", error);
    }
  },
};
