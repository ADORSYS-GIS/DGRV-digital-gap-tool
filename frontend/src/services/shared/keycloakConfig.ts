import Keycloak from "keycloak-js";

/**
 * Keycloak configuration for the DGAT tool
 */
export const keycloakConfig = {
  url: window.location.origin, // Use same origin to leverage Vite proxy
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "DGAT",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "DGAT-tool",
};

/**
 * Initialize Keycloak instance with configuration
 */
export const keycloak = new Keycloak({
  url: keycloakConfig.url,
  realm: keycloakConfig.realm,
  clientId: keycloakConfig.clientId,
});

/**
 * Keycloak initialization options
 */
export const keycloakInitOptions = {
  onLoad: "check-sso" as const, // Check authentication status without automatic redirect
  pkceMethod: "S256" as const,
  checkLoginIframe: false,
  enableLogging: import.meta.env.DEV,
  silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
};
