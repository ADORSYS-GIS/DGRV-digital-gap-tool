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
import { syncManager } from "@/services/sync/syncManager";

const INACTIVITY_LOGOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
] as const;

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

    console.log("AuthProvider: updateAuthState called", {
      isAuthenticated,
      hasUser: !!user,
      userOrganization: user?.organization,
      hasKeycloakToken: !!keycloak.token,
      hasKeycloakTokenParsed: !!keycloak.tokenParsed
    });

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
    if (!authState.isAuthenticated) return;

    let timeoutId: ReturnType<typeof window.setTimeout>;

    const resetInactivityTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void logout();
      }, INACTIVITY_LOGOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [authState.isAuthenticated, logout]);

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
          
          // When offline and no keycloak token is set, restore it manually
          // This ensures getOrganizationId() works properly
          if (!navigator.onLine && cachedTokens?.accessToken && !keycloak.token) {
            try {
              console.log("AuthProvider: Manually restoring Keycloak token for offline use");
              keycloak.token = cachedTokens.accessToken;
              keycloak.refreshToken = cachedTokens.refreshToken;
              keycloak.idToken = cachedTokens.idToken;
              keycloak.authenticated = true;
              
              // Parse the token manually for offline organization extraction
              if (cachedTokens.accessToken) {
                const tokenPayload = JSON.parse(atob(cachedTokens.accessToken.split('.')[1]));
                keycloak.tokenParsed = tokenPayload;
                console.log("AuthProvider: Token restored with organization claims:", {
                  hasOrganization: !!tokenPayload.organization,
                  hasOrganizations: !!tokenPayload.organizations,
                  hasCooperation: !!tokenPayload.cooperation,
                  sub: tokenPayload.sub
                });
              }
            } catch (tokenError) {
              console.warn("AuthProvider: Failed to parse cached token:", tokenError);
            }
          } else if (keycloak.token) {
            console.log("AuthProvider: Keycloak token already present");
          }
          
          setAuthState({
            isAuthenticated: true,
            user: cachedProfile,
            roles: cachedProfile.roles || [],
            loading: false
          });
          
          console.log("AuthProvider: Rehydrated user profile", {
            hasOrganization: !!cachedProfile.organization,
            organization: cachedProfile.organization,
            roles: cachedProfile.roles
          });
          
          return; // Early return to prevent further processing
        }
      } catch (err) {
        console.warn("AuthProvider: Failed to re-hydrate from cache:", err);
      }
      
      // If rehydration failed or no cached data, set loading to false
      // This prevents infinite loading states
      if (!keycloak.authenticated && !keycloak.token) {
        setAuthState(prev => ({ ...prev, loading: false }));
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

  useEffect(() => {
    if (authState.loading) return;
    if (!authState.isAuthenticated) return;
    if (!navigator.onLine) return;

    const PRECACHE_KEY = "__gap_precache_after_auth_v1__";
    if (sessionStorage.getItem(PRECACHE_KEY)) return;
    sessionStorage.setItem(PRECACHE_KEY, "1");

    const orgId = authService.getOrganizationId();
    syncManager.precacheAll(orgId).catch((e: unknown) => {
      console.warn("Pre-cache after auth failed:", e);
    });
  }, [authState.isAuthenticated, authState.loading]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
      <InvitationPendingDialog isOpen={isInvitationPending} />
    </AuthContext.Provider>
  );
};
