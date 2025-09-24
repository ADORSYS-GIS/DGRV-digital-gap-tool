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

const App = () => {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
};

export default App;
