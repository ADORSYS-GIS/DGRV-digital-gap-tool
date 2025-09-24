/**
 * React hook for managing Keycloak authentication state and operations.
 * This hook provides a centralized way to access authentication information
 * and perform authentication actions throughout the application.
 *
 * Returns:
 * - isAuthenticated: Boolean indicating if user is authenticated
 * - user: User profile information or null
 * - roles: Array of user roles
 * - login: Function to initiate login
 * - logout: Function to initiate logout
 * - loading: Boolean indicating if authentication state is being determined
 */
import { AuthState } from "@/types/auth";
import React from "react";
import { authService } from "../../services/shared/authService";
import { keycloak } from "../../services/shared/keycloakConfig";

interface AuthHookState extends AuthState {
  login: () => void;
  logout: () => void;
}

export const useAuth = (): AuthHookState => {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
    roles: [],
    loading: true,
  });

  React.useEffect(() => {
    const updateAuthState = () => {
      const state = authService.getAuthState();
      setAuthState(state);
    };

    const initializeKeycloak = async () => {
      if (keycloak.authenticated !== undefined) {
        updateAuthState();
        return;
      }

      try {
        await authService.initialize();
        updateAuthState();
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          roles: [],
          loading: false,
        });
      }

      return () => {};
    };

    let cleanupTokenRefresh: () => void = () => {};

    initializeKeycloak().then((cleanup) => {
      if (cleanup) {
        cleanupTokenRefresh = cleanup;
      }
    });

    const onTokenExpired = () => {
      updateAuthState();
    };

    const onAuthSuccess = () => {
      updateAuthState();
    };

    const onAuthLogout = () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        roles: [],
        loading: false,
      });
    };

    const onAuthError = () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        roles: [],
        loading: false,
      });
    };

    keycloak.onTokenExpired = onTokenExpired;
    keycloak.onAuthSuccess = onAuthSuccess;
    keycloak.onAuthLogout = onAuthLogout;
    keycloak.onAuthError = onAuthError;

    return () => {
      keycloak.onTokenExpired = () => {};
      keycloak.onAuthSuccess = () => {};
      keycloak.onAuthLogout = () => {};
      keycloak.onAuthError = () => {};
      cleanupTokenRefresh();
    };
  }, []);

  const login = React.useCallback(async () => {
    try {
      await authService.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};
