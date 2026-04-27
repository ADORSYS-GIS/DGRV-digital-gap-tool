import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

// Global circuit breaker to prevent infinite reloads
const RELOAD_COUNTER_KEY = "__reload_counter__";
const MAX_RELOADS = 3;
const RELOAD_WINDOW = 30000; // 30 seconds

const checkReloadLimit = () => {
  const now = Date.now();
  const reloadData = sessionStorage.getItem(RELOAD_COUNTER_KEY);
  
  if (reloadData) {
    const { count, timestamp } = JSON.parse(reloadData);
    
    // Reset counter if window has passed
    if (now - timestamp > RELOAD_WINDOW) {
      sessionStorage.setItem(RELOAD_COUNTER_KEY, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    // Check if we've exceeded the limit
    if (count >= MAX_RELOADS) {
      console.error("Reload limit exceeded, preventing infinite reload loop");
      return false;
    }
    
    // Increment counter
    sessionStorage.setItem(RELOAD_COUNTER_KEY, JSON.stringify({ count: count + 1, timestamp }));
    return true;
  } else {
    // First reload
    sessionStorage.setItem(RELOAD_COUNTER_KEY, JSON.stringify({ count: 1, timestamp: now }));
    return true;
  }
};

const safeReload = (reason: string) => {
  if (checkReloadLimit()) {
    console.log(`Safe reload triggered: ${reason}`);
    window.location.reload();
  } else {
    console.error(`Reload blocked to prevent infinite loop: ${reason}`);
  }
};

// On first load after a new deploy, unregister all old service workers so the
// new one can install cleanly. We track this with a version key in localStorage.
const SW_VERSION_KEY = "sw_version";
const CURRENT_SW_VERSION = "v6"; // bump this with each deploy that changes the SW
const SW_RELOAD_KEY = "__sw_reload_attempted__";

if (localStorage.getItem(SW_VERSION_KEY) !== CURRENT_SW_VERSION && !sessionStorage.getItem(SW_RELOAD_KEY)) {
  if ("serviceWorker" in navigator) {
    sessionStorage.setItem(SW_RELOAD_KEY, "1");
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister());
      // Clear all SW caches so the new SW starts fresh
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }).then(() => {
      localStorage.setItem(SW_VERSION_KEY, CURRENT_SW_VERSION);
      // Only reload if we're online to avoid infinite loops when offline
      if (navigator.onLine) {
        safeReload("Service worker version update");
      }
    });
  } else {
    localStorage.setItem(SW_VERSION_KEY, CURRENT_SW_VERSION);
  }
}

// Register Service Worker for PWA support
registerSW({
  immediate: true,
  onNeedRefresh() {
    // New SW waiting — only reload if online to avoid infinite loops
    if (navigator.onLine) {
      console.log("PWA: New service worker available, reloading...");
      safeReload("PWA service worker update");
    } else {
      console.log("PWA: New service worker available but offline, skipping reload");
    }
  },
  onOfflineReady() {
    console.log("PWA: App ready to work offline.");
  },
  onRegistered(r) {
    console.log("PWA: Service Worker registered:", r);
  },
  onRegisterError(error) {
    console.error("PWA: Service Worker registration failed:", error);
  }
});

// Handle Vite chunk load failures after new deployments.
// When a new build is deployed, old chunk hash URLs no longer exist on the
// server. Vite fires "vite:preloadError" when a dynamic import 404s.
// We reload once to pick up the new index.html and fresh chunks.
window.addEventListener("vite:preloadError", () => {
  const RELOAD_KEY = "__vite_reload_attempted__";
  if (!sessionStorage.getItem(RELOAD_KEY) && navigator.onLine) {
    sessionStorage.setItem(RELOAD_KEY, "1");
    console.log("Vite: Chunk load failed, reloading...");
    safeReload("Vite chunk load failure");
  } else if (!navigator.onLine) {
    console.log("Vite: Chunk load failed but offline, skipping reload");
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
    console.error("Keycloak initialization error (likely offline or server unreachable):", error);

    // If we have cached tokens, proceed as authenticated regardless of whether
    // the browser thinks it's online — the Keycloak server may simply be unreachable.
    if (cachedTokens?.accessToken) {
      console.log("Keycloak unreachable — proceeding with cached tokens.");
      (keycloak as any).token = cachedTokens.accessToken;
      (keycloak as any).refreshToken = cachedTokens.refreshToken;
      (keycloak as any).idToken = cachedTokens.idToken;
      (keycloak as any).authenticated = true;
      try {
        (keycloak as any).tokenParsed = JSON.parse(atob(cachedTokens.accessToken.split('.')[1]));
      } catch {
        console.warn("Could not parse cached token payload.");
      }
      if (keycloak.onReady) keycloak.onReady(true);
    } else {
      // No cached tokens at all — user has never logged in on this device
      if (keycloak.onReady) keycloak.onReady(false);
    }
  }
  syncManager.initialize();
};

initializeAuth();
