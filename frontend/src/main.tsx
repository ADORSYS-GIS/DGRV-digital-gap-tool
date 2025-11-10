import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { keycloak, keycloakInitOptions } from "./services/shared/keycloakConfig";
import { authService } from "./services/shared/authService";

const queryClient = new QueryClient();
const root = createRoot(document.getElementById("root")!);

const renderApp = () => {
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

keycloak
  .init(keycloakInitOptions)
  .then((authenticated) => {
    if (authenticated) {
      authService.storeTokens();
      console.log("Keycloak initialized successfully - User authenticated");
    } else {
      console.log(
        "Keycloak initialized - User not authenticated (check-sso mode)",
      );
    }
    renderApp();
  })
  .catch((error) => {
    console.error("Failed to initialize Keycloak:", error);
    root.render(<div>Failed to initialize authentication service.</div>);
  });
