import { authService } from "../shared/authService";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { cooperationSyncService } from "./cooperationSyncService";
import { digitalisationLevelSyncService } from "./digitalisationLevelSyncService";
import { organizationDimensionSyncService } from "./organizationDimensionSyncService";
import { dimensionSyncService } from "./dimensionSyncService";
import { digitalisationGapSyncService } from "./digitalisationGapSyncService";
import { recommendationSyncService } from "./recommendationSyncService";
import { userSyncService } from "./userSyncService";
import { queryClient } from "@/main";

export const syncManager = {
  initialize() {
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  },

  destroy() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  },

  handleOnline() {
    console.log("Application is back online. Starting sync...");
    const organizationId = authService.getOrganizationId();
    syncManager.syncAll(organizationId);
  },

  handleOffline() {
    console.log("Application is offline.");
  },

  async syncAll(organizationId: string | null) {
    try {
      await dimensionSyncService.sync();
      await digitalisationLevelSyncService.sync();
      await digitalisationGapSyncService.sync();
      await recommendationSyncService.sync();
      await userSyncService.sync();
      if (organizationId) {
        await cooperationSyncService.sync(organizationId);
        await organizationDimensionSyncService.syncPendingAssignments();
        await cooperationUserSyncService.sync();
      }
      // Add other sync services here in the future
      console.log("All data synced successfully.");
    } catch (error) {
      console.error("An error occurred during sync:", error);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["digitalisationLevels"] });
    }
  },
};
