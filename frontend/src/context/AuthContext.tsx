import { authService } from "@/services/shared/authService";
import { keycloak } from "@/services/shared/keycloakConfig";
import { AuthContextType, AuthState } from "@/types/auth";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    roles: [],
    loading: true,
  });

  const updateAuthState = useCallback(() => {
    const isAuthenticated = !!keycloak.token;
    const user = authService.getUserProfile();
    const roles = user?.roles || [];
    setAuthState({
      isAuthenticated,
      user,
      roles,
      loading: false,
    });
  }, []);

  const login = useCallback(async () => {
    await keycloak.login();
  }, []);

  const logout = useCallback(async () => {
    await keycloak.logout();
  }, []);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        });

        if (authenticated) {
          await authService.storeTokens();
        }
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
      } finally {
        updateAuthState();
      }
    };

    initKeycloak();

    keycloak.onAuthSuccess = () => {
      authService.storeTokens();
      updateAuthState();
    };
    keycloak.onAuthError = () => updateAuthState();
    keycloak.onAuthRefreshSuccess = () => {
      authService.storeTokens();
      updateAuthState();
    };
    keycloak.onAuthRefreshError = () => {
      authService.clearStoredTokens();
      updateAuthState();
    };
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        authService.clearStoredTokens();
        keycloak.clearToken();
        updateAuthState();
      });
    };

    return () => {
      keycloak.onAuthSuccess = () => {};
      keycloak.onAuthError = () => {};
      keycloak.onAuthRefreshSuccess = () => {};
      keycloak.onAuthRefreshError = () => {};
      keycloak.onTokenExpired = () => {};
    };
  }, [updateAuthState]);

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
