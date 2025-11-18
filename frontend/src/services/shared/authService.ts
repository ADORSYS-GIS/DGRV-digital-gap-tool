import { AuthState, UserProfile } from "@/types/auth";
import { del, set } from "idb-keyval";
import { KeycloakTokenParsed } from "keycloak-js";
import { keycloak } from "./keycloakConfig";

interface CustomKeycloakTokenParsed extends KeycloakTokenParsed {
  roles?: string[];
}

/**
 * Core authentication service operations
 */
export const authService = {
  /**
   * Login user
   */
  async login(redirectUri?: string): Promise<void> {
    try {
      await keycloak.login({
        redirectUri: redirectUri || window.location.origin,
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(
        `Login failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  /**
   * Logout user
   */
  async logout(redirectUri?: string): Promise<void> {
    try {
      await this.clearStoredTokens();
      await keycloak.logout({
        redirectUri: redirectUri || window.location.origin,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, we should clear local tokens
      await this.clearStoredTokens();
      keycloak.clearToken();
    }
  },

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      if (!keycloak.token || !keycloak.tokenParsed?.exp) {
        return null;
      }

      // Refresh token if needed (30 seconds before expiry)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = keycloak.tokenParsed.exp - now;

      if (timeUntilExpiry <= 30) {
        try {
          const refreshed = await keycloak.updateToken(30);
          if (refreshed) {
            await this.storeTokens();
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
          // Clear tokens on refresh failure to force re-authentication
          await this.clearStoredTokens();
          keycloak.clearToken();
          return null;
        }
      }

      return keycloak.token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },

  /**
   * Get user profile from token
   */
  getUserProfile(): UserProfile | null {
    try {
      if (!keycloak.tokenParsed) return null;

      const token = keycloak.tokenParsed as CustomKeycloakTokenParsed;

      const realmRoles = token.realm_access?.roles || [];
      const resourceRoles = token.roles || [];
      const allRoles = [...new Set([...realmRoles, ...resourceRoles])];

      return {
        sub: token.sub || "",
        preferred_username: token.preferred_username,
        name: token.name,
        email: token.email,
        roles: allRoles,
        realm_access: token.realm_access
          ? { roles: token.realm_access.roles || [] }
          : undefined,
        organization_name: token.organization_name,
        organization: token.organization,
      };
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  },

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    const isAuthenticated = !!keycloak.authenticated;
    const user = this.getUserProfile();
    const roles = user?.roles || [];

    return {
      isAuthenticated,
      user,
      roles,
      loading: false, // This should be dynamic based on actual loading state
    };
  },

  /**
   * Check if user has required role
   */
  hasRole(requiredRoles: string[]): boolean {
    const user = this.getUserProfile();
    if (!user) return false;

    const userRoles = (user.roles || []).map((role) => role.toLowerCase());

    return requiredRoles.some((role) => userRoles.includes(role.toLowerCase()));
  },

  /**
   * Store authentication tokens in IndexedDB
   */
  async storeTokens(): Promise<void> {
    try {
      const tokens = {
        accessToken: keycloak.token,
        refreshToken: keycloak.refreshToken,
        idToken: keycloak.idToken,
        expiresAt: keycloak.tokenParsed?.exp,
      };

      await set("auth_tokens", tokens);
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  },

  /**
   * Clear stored tokens from IndexedDB
   */
  async clearStoredTokens(): Promise<void> {
    try {
      await del("auth_tokens");
    } catch (error) {
      console.error("Failed to clear stored tokens:", error);
    }
  },

  /**
   * Create authenticated fetch function
   */
  async fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const token = await this.getAccessToken();

    if (token) {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);

      return fetch(input, {
        ...init,
        headers,
      });
    }

    return fetch(input, init);
  },
};
