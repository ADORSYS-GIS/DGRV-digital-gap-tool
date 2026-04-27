/**
 * Utility functions to help test offline functionality
 */

export const offlineTestHelper = {
  /**
   * Simulate going offline
   */
  goOffline() {
    // Override navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Dispatch offline event
    window.dispatchEvent(new Event('offline'));
    console.log('Simulated offline mode');
  },

  /**
   * Simulate going online
   */
  goOnline() {
    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Dispatch online event
    window.dispatchEvent(new Event('online'));
    console.log('Simulated online mode');
  },

  /**
   * Check if we're currently offline
   */
  isOffline() {
    return !navigator.onLine;
  },

  /**
   * Test organization ID extraction from cached tokens
   */
  async testOfflineOrgExtraction() {
    try {
      const { get } = await import('idb-keyval');
      const cachedTokens = await get('auth_tokens');
      const cachedProfile = await get('auth_profile');
      
      console.log('Cached tokens:', cachedTokens ? 'Present' : 'Missing');
      console.log('Cached profile:', cachedProfile ? 'Present' : 'Missing');
      
      if (cachedProfile?.organization) {
        console.log('Organization from cached profile:', cachedProfile.organization);
      }
      
      if (cachedTokens?.accessToken) {
        try {
          const tokenPayload = JSON.parse(atob(cachedTokens.accessToken.split('.')[1]));
          console.log('Token payload organization claims:', {
            organization: tokenPayload.organization,
            organizations: tokenPayload.organizations,
            cooperation: tokenPayload.cooperation
          });
        } catch (e) {
          console.error('Failed to parse cached token:', e);
        }
      }

      // Test the authService method
      const { authService } = await import('../services/shared/authService');
      const orgId = authService.getOrganizationId();
      console.log('authService.getOrganizationId() result:', orgId);
      
      return {
        hasCachedTokens: !!cachedTokens,
        hasCachedProfile: !!cachedProfile,
        organizationFromProfile: cachedProfile?.organization,
        organizationFromAuthService: orgId,
        isOffline: !navigator.onLine
      };
    } catch (error) {
      console.error('Failed to check cached auth data:', error);
      return { error: error.message };
    }
  },

  /**
   * Show debug info in the console
   */
  async showDebugInfo() {
    const result = await this.testOfflineOrgExtraction();
    console.table(result);
    return result;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).offlineTestHelper = offlineTestHelper;
}