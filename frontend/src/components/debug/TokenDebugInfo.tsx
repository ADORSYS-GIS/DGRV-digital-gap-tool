import React from 'react';
import { authService } from '@/services/shared/authService';
import { keycloak } from '@/services/shared/keycloakConfig';
import { useAuth } from '@/context/AuthContext';

export const TokenDebugInfo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const { get } = await import('idb-keyval');
        const cachedTokens = await get('auth_tokens');
        const cachedProfile = await get('auth_profile');
        
        const orgId = authService.getOrganizationId();
        
        setDebugInfo({
          isAuthenticated,
          hasKeycloakToken: !!keycloak.token,
          hasKeycloakTokenParsed: !!keycloak.tokenParsed,
          keycloakAuthenticated: keycloak.authenticated,
          organizationId: orgId,
          userFromContext: user,
          cachedTokensPresent: !!cachedTokens,
          cachedProfilePresent: !!cachedProfile,
          isOnline: navigator.onLine,
          tokenClaims: keycloak.tokenParsed ? {
            organization: (keycloak.tokenParsed as any).organization,
            organizations: (keycloak.tokenParsed as any).organizations,
            cooperation: (keycloak.tokenParsed as any).cooperation,
          } : null
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    getDebugInfo();
  }, [isAuthenticated, user]);

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs font-mono">
      <h3 className="font-bold mb-2">Token Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};