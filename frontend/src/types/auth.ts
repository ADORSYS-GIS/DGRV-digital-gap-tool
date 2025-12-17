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
  cooperation?: string;
  /**
   * Optional list of dimension IDs the user is allowed to answer.
   * Relevant for coop_user role.
   */
  assigned_dimensions?: string[];
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
