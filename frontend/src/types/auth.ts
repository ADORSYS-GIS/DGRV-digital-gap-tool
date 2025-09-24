/**
 * User profile interface
 */
export interface UserProfile {
  sub: string;
  preferred_username?: string;
  name?: string;
  email?: string;
  roles?: string[];
  realm_access?: { roles: string[] } | undefined;
  organization_name?: string;
  organization?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  roles: string[];
  loading: boolean;
}
