import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Import the i18n configuration
import App from "./App";
import "./index.css";
import {
  keycloak,
  keycloakInitOptions,
} from "./services/shared/keycloakConfig";
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
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

// Render the application immediately
renderApp();

// Initialize Keycloak asynchronously
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
  })
  .catch((error) => {
    console.error("Failed to initialize Keycloak:", error);
    // Optionally, you could set an error state here if needed for the UI
  });
