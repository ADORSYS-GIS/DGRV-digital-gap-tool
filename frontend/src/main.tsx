import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { keycloak, keycloakInitOptions } from "./services/shared/keycloakConfig";
import { authService } from "./services/shared/authService";
import { OpenAPI } from "./openapi-client/core/OpenAPI";

// Register OpenAPI request middleware to add Bearer token
OpenAPI.interceptors.request.use(async (request) => {
  try {
    const token = await authService.getAccessToken();
    if (token) {
      if (!request.headers) request.headers = {};
      // If headers is a Headers object, convert to plain object
      if (
        typeof Headers !== "undefined" &&
        request.headers instanceof Headers
      ) {
        request.headers.set("Authorization", `Bearer ${token}`);
      } else {
        (request.headers as Record<string, string>)["Authorization"] =
          `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn("Failed to get Keycloak token for request:", error);
  }
  return request;
});

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