/**
 * Main application component that handles authentication state and routing.
 * This component serves as the entry point for the application, managing:
 * - Global error boundaries
 * - Authentication state detection
 * - Conditional rendering based on authentication status
 * - Loading states during authentication initialization
 */
import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { syncService } from "./services/sync/syncService";

const App = () => {
  useEffect(() => {
    const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

    // Initial sync attempt
    syncService.processSyncQueue();

    // Set up periodic sync
    const intervalId = setInterval(
      () => syncService.processSyncQueue(),
      SYNC_INTERVAL,
    );

    // Listen for online/offline events to trigger sync
    const handleOnline = () => {
      console.log("App is online, attempting to sync...");
      syncService.processSyncQueue();
    };

    window.addEventListener("online", handleOnline);

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
};

export default App;
