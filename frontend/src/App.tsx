/**
 * Main application component that handles authentication state and routing.
 * This component serves as the entry point for the application, managing:
 * - Global error boundaries
 * - Authentication state detection
 * - Conditional rendering based on authentication status
 * - Loading states during authentication initialization
 */
import AppRouter from "./router/AppRouter";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { FullPageLoader } from "./components/shared/LoadingSpinner";
import { useAuth } from "./hooks/shared/useAuth";

const AuthenticatedUserApp = () => {
  return <AppRouter />;
};

const UnauthenticatedApp = () => {
  return <AppRouter />;
};

const AuthenticatedApp = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return <FullPageLoader text="Initializing..." />;
  }

  return isAuthenticated ? <AuthenticatedUserApp /> : <UnauthenticatedApp />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthenticatedApp />
    </ErrorBoundary>
  );
};

export default App;
