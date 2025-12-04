import { AuthState, UserProfile } from "@/types/auth";
import { del, set } from "idb-keyval";
import { KeycloakTokenParsed } from "keycloak-js";
import { keycloak } from "./keycloakConfig";

interface CustomKeycloakTokenParsed extends KeycloakTokenParsed {
  roles?: string[];
  organizations?: {
    [key: string]: {
      id: string;
      displayName?: string[];
    };
  };
  cooperation?: string[];
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

      const userProfile: UserProfile = {
        sub: token.sub || "",
        roles: allRoles,
      };

      if (token.preferred_username) {
        userProfile.preferred_username = token.preferred_username;
      }
      if (token.name) {
        userProfile.name = token.name;
      }
      if (token.email) {
        userProfile.email = token.email;
      }
      if (token.realm_access) {
        userProfile.realm_access = { roles: token.realm_access.roles || [] };
      }
      const orgs = token.organizations;
      if (orgs) {
        const orgNames = Object.keys(orgs);
        const orgName = orgNames[0];
        if (orgName) {
          userProfile.organization_name = orgName;
          const organizationDetails = orgs[orgName];
          if (organizationDetails?.id) {
            userProfile.organization = organizationDetails.id;
          }
        }
      }

      return userProfile;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  },

  /**
   * Get organization ID from token
   */
  getOrganizationId(): string | null {
    try {
      if (!keycloak.tokenParsed) return null;

      const token = keycloak.tokenParsed as CustomKeycloakTokenParsed;
      const orgs = token.organizations;
      if (orgs) {
        const orgNames = Object.keys(orgs);
        const orgName = orgNames[0];
        if (orgName) {
          const organizationDetails = orgs[orgName];
          return organizationDetails?.id || null;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to get organization ID:", error);
      return null;
    }
  },

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    const isAuthenticated = !!keycloak.authenticated || !!keycloak.token;
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
   * Get cooperation path from ID token
   */
  getCooperationPath(): string | null {
    try {
      if (!keycloak.tokenParsed) return null;
      const token = keycloak.tokenParsed as CustomKeycloakTokenParsed;
      // First, try the dedicated 'cooperation' claim
      if (token.cooperation && token.cooperation.length > 0) {
        const cooperationPath = token.cooperation[0];
        if (cooperationPath) {
          return cooperationPath;
        }
      }
      // If not found, try to derive it from the 'organizations' claim
      const orgs = token.organizations;
      if (orgs) {
        const orgPaths = Object.keys(orgs);
        const firstPath = orgPaths[0];
        if (firstPath) {
          const pathParts = firstPath.split("/").filter((p) => p);
          if (pathParts.length > 1) {
            return `/${pathParts[0]}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting cooperation path from token:", error);
      return null;
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
