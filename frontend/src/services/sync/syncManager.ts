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
};
