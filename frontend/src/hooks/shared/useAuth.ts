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
import React, { useContext } from "react";
import { AuthState } from "@/types/auth";
import { authService } from "../../services/shared/authService";
import { keycloak } from "../../services/shared/keycloakConfig";
import { AuthContext } from "./authContext";

interface AuthHookState extends AuthState {
  login: () => void;
  logout: () => void;
}

export const useProvideAuth = (): AuthHookState => {
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

    const onAuthSuccess = () => updateAuthState();
    const onAuthError = () => updateAuthState();
    const onAuthLogout = () => updateAuthState();
    const onTokenExpired = () => keycloak.updateToken(30);

    keycloak.onAuthSuccess = onAuthSuccess;
    keycloak.onAuthError = onAuthError;
    keycloak.onAuthLogout = onAuthLogout;
    keycloak.onTokenExpired = onTokenExpired;

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

export const useAuth = (): AuthHookState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
