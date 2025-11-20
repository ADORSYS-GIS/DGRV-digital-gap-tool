import { cooperationSyncService } from "./cooperationSyncService";
import { organizationDimensionSyncService } from "./organizationDimensionSyncService";

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
    syncManager.syncAll();
  },

  handleOffline() {
    console.log("Application is offline.");
  },

  async syncAll() {
    try {
      await cooperationSyncService.sync();
      await organizationDimensionSyncService.syncPendingAssignments();
      // Add other sync services here in the future
      console.log("All data synced successfully.");
    } catch (error) {
      console.error("An error occurred during sync:", error);
    }
  },
};
