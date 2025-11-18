/**
 * Main application component that handles authentication state and routing.
 * This component serves as the entry point for the application, managing:
 * - Global error boundaries
 * - Authentication state detection
 * - Conditional rendering based on authentication status
 * - Loading states during authentication initialization
 */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AppRouter from "./router/AppRouter";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { syncService } from "./services/sync/syncService";

const App = () => {
  const { t } = useTranslation();

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
      console.log(t("app.onlineSyncMessage"));
      syncService.processSyncQueue();
    };

    window.addEventListener("online", handleOnline);

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
    };
  }, [t]);

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
};

export default App;
