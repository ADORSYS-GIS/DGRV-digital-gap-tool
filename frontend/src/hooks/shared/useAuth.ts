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
      setAuthState({ ...state, loading: false });
    };

    updateAuthState();

    keycloak.onAuthSuccess = () => updateAuthState();
    keycloak.onAuthError = () => updateAuthState();
    keycloak.onAuthLogout = () => updateAuthState();
    keycloak.onTokenExpired = () => keycloak.updateToken(30);

    return () => {
      keycloak.onAuthSuccess = () => {};
      keycloak.onAuthError = () => {};
      keycloak.onAuthLogout = () => {};
      keycloak.onTokenExpired = () => {};
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
