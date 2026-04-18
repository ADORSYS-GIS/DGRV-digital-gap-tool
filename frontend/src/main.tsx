import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import "./i18n";
import {
  keycloak,
  keycloakInitOptions,
} from "./services/shared/keycloakConfig";
import { authService } from "./services/shared/authService";
import { OpenAPI } from "./openapi-client/core/OpenAPI";
import { syncManager } from "./services/sync/syncManager";
import { queryClient } from "./lib/queryClient";
import { db } from "./services/db";

// One-time migration: clear the action_plans IndexedDB table that may contain
// cross-cooperation data from the old global sync. Safe to run on every boot —
// the data is always re-fetched per-assessment from the API.
const ACTION_PLANS_CACHE_CLEARED = "action_plans_cache_v2_cleared";
if (!localStorage.getItem(ACTION_PLANS_CACHE_CLEARED)) {
  db.action_plans.clear().then(() => {
    localStorage.setItem(ACTION_PLANS_CACHE_CLEARED, "1");
  });
}

// Register OpenAPI request middleware to add Bearer token
OpenAPI.interceptors.request.use(async (request) => {
  try {
    const token = await authService.getAccessToken();
    if (token) {
      if (!request.headers) request.headers = {};
      if (typeof Headers !== "undefined" && request.headers instanceof Headers) {
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

const root = createRoot(document.getElementById("root")!);

// Render immediately — AuthContext starts with loading=true so the router
// shows a spinner until Keycloak resolves below.
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);

// Single Keycloak init — AuthContext does NOT call init again.
keycloak
  .init(keycloakInitOptions)
  .then(async (authenticated) => {
    if (authenticated) {
      await authService.storeTokens();
      console.log("Keycloak initialized — user authenticated");
    } else {
      console.log("Keycloak initialized — user not authenticated");
    }
    // Notify AuthContext that Keycloak is ready by firing onAuthSuccess/onReady.
    // keycloak.onReady fires after init regardless of auth state.
    if (keycloak.onReady) keycloak.onReady(authenticated);
    syncManager.initialize();
  })
  .catch((error) => {
    console.error("Failed to initialize Keycloak:", error);
    // Fire onReady with false so AuthContext stops loading even on error.
    if (keycloak.onReady) keycloak.onReady(false);
  });
