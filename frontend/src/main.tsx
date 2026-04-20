import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

// Register Service Worker for PWA support
registerSW({ immediate: true });

// Handle Vite chunk load failures after new deployments.
// When a new build is deployed, old chunk hash URLs no longer exist on the
// server. Vite fires "vite:preloadError" when a dynamic import 404s.
// We reload once to pick up the new index.html and fresh chunks.
window.addEventListener("vite:preloadError", () => {
  const RELOAD_KEY = "__vite_reload_attempted__";
  if (!sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  }
});

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

import { get } from "idb-keyval";

// Single Keycloak init — AuthContext does NOT call init again.
const initializeAuth = async () => {
  let cachedTokens: any = null;
  try {
    cachedTokens = await get("auth_tokens");
  } catch (e) {
    console.warn("Failed to load cached tokens:", e);
  }

  const initOptions: any = {
    ...keycloakInitOptions,
  };

  if (cachedTokens?.accessToken) {
    initOptions.token = cachedTokens.accessToken;
    initOptions.refreshToken = cachedTokens.refreshToken;
    initOptions.idToken = cachedTokens.idToken;
  }

  try {
    const authenticated = await keycloak.init(initOptions);
    console.log(`Keycloak initialized — user authenticated: ${authenticated}`);
    if (authenticated) {
      await authService.storeTokens();
    }
    if (keycloak.onReady) keycloak.onReady(authenticated);
  } catch (error) {
    console.error("Keycloak initialization error (likely offline):", error);

    // If we are offline and have cached tokens, we try to proceed as "authenticated"
    // even if Keycloak server couldn't confirm it.
    if (!navigator.onLine && cachedTokens?.accessToken) {
      console.log("Offline and have cached tokens — proceeding as authenticated.");
      // Manually populating Keycloak instance properties
      (keycloak as any).token = cachedTokens.accessToken;
      (keycloak as any).refreshToken = cachedTokens.refreshToken;
      (keycloak as any).idToken = cachedTokens.idToken;
      (keycloak as any).authenticated = true;
      (keycloak as any).tokenParsed = JSON.parse(atob(cachedTokens.accessToken.split('.')[1]));

      if (keycloak.onReady) keycloak.onReady(true);
    } else {
      // Fallback to unauthenticated state
      if (keycloak.onReady) keycloak.onReady(false);
    }
  }
  syncManager.initialize();
};

initializeAuth();
