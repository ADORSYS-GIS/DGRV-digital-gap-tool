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
    // Start as loading=true; effect below re-hydrates from cache or waits for Keycloak
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
    // 1. Instant re-hydration: check for cached profile and tokens immediately
    // This prevents the "logout on refresh" issue while offline.
    const rehydrate = async () => {
      try {
        const { get } = await import("idb-keyval");
        const cachedProfile = await get("auth_profile");
        const cachedTokens = await get("auth_tokens");

        if (cachedProfile && (cachedTokens?.accessToken || !!keycloak.token)) {
          console.log("AuthProvider: Re-hydrating session from cache.");
          setAuthState({
            isAuthenticated: true,
            user: cachedProfile,
            roles: cachedProfile.roles || [],
            loading: false
          });
        }
      } catch (err) {
        console.warn("AuthProvider: Failed to re-hydrate from cache:", err);
      }
    };

    rehydrate();

    // 2. Attach Keycloak listeners for live updates
    if (keycloak.authenticated || !!keycloak.token) {
      updateAuthState();
    }

    keycloak.onReady = (authenticated) => {
      console.log(`AuthProvider: Keycloak ready (authenticated: ${authenticated})`);
      updateAuthState();
    };

    keycloak.onAuthSuccess = () => {
      console.log("AuthProvider: Authentication successful.");
      authService.storeTokens();
      updateAuthState();
    };

    keycloak.onAuthError = (error) => {
      console.error("AuthProvider: Authentication error:", error);
      updateAuthState();
    };

    keycloak.onAuthRefreshSuccess = () => {
      authService.storeTokens();
      updateAuthState();
    };

    keycloak.onAuthRefreshError = () => {
      console.warn("AuthProvider: Refresh failed — clearing tokens if online.");
      if (navigator.onLine) {
        authService.clearStoredTokens();
        updateAuthState();
      }
    };

    keycloak.onTokenExpired = () => {
      if (!navigator.onLine) {
        console.warn("AuthProvider: Token expired while offline — keeping current session.");
        return;
      }
      keycloak.updateToken(30).catch(() => {
        console.error("AuthProvider: Token update failed while online — logging out.");
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
