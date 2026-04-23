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
import { InvitationPendingDialog } from "@/components/shared/InvitationPendingDialog";
import { ROLES } from "@/constants/roles";

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
    // Start as loading=true; main.tsx resolves Keycloak and calls updateAuthState
    loading: true,
  });
  const [isInvitationPending, setIsInvitationPending] = useState(false);

  const updateAuthState = useCallback(() => {
    const isAuthenticated = !!keycloak.token;
    const user = authService.getUserProfile();
    const roles = user?.roles || [];

    if (roles.includes(ROLES.ORG_ADMIN) && user?.is_member_of === false) {
      setIsInvitationPending(true);
    } else {
      setIsInvitationPending(false);
    }

    setAuthState({ isAuthenticated, user, roles, loading: false });
  }, []);

  const login = useCallback(async () => {
    await authService.login();
    updateAuthState();
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    await authService.logout();
    updateAuthState();
  }, [updateAuthState]);

  useEffect(() => {
    // Immediately check if keycloak was already initialized by main.tsx
    // This is crucial for offline re-hydration sessions.
    if (keycloak.authenticated || !!keycloak.token) {
      updateAuthState();
    }

    keycloak.onReady = () => {
      updateAuthState();
    };

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
      if (!navigator.onLine) {
        // Offline — keep the expired token in memory so IndexedDB reads still work.
        // It will be refreshed automatically once we're back online.
        console.warn("Token expired while offline — keeping cached token.");
        return;
      }
      keycloak.updateToken(30).catch(() => {
        authService.clearStoredTokens();
        keycloak.clearToken();
        updateAuthState();
      });
    };

    return () => {
      keycloak.onReady = () => { };
      keycloak.onAuthSuccess = () => { };
      keycloak.onAuthError = () => { };
      keycloak.onAuthRefreshSuccess = () => { };
      keycloak.onAuthRefreshError = () => { };
      keycloak.onTokenExpired = () => { };
    };
  }, [updateAuthState]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
      <InvitationPendingDialog isOpen={isInvitationPending} />
    </AuthContext.Provider>
  );
};
