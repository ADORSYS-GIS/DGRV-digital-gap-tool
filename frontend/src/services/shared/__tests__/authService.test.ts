import { describe, it, expect } from "vitest";
import { authService } from "../authService";

describe("authService", () => {
  it("should exist and be importable", () => {
    // This test verifies that the service can be imported without errors
    expect(authService).toBeDefined();
  });

  it("should have expected methods", () => {
    // Check that the service has the expected methods
    expect(typeof authService.login).toBe("function");
    expect(typeof authService.logout).toBe("function");
    expect(typeof authService.getAccessToken).toBe("function");
    expect(typeof authService.getUserProfile).toBe("function");
    expect(typeof authService.getAuthState).toBe("function");
    expect(typeof authService.hasRole).toBe("function");
    expect(typeof authService.storeTokens).toBe("function");
    expect(typeof authService.clearStoredTokens).toBe("function");
    expect(typeof authService.fetchWithAuth).toBe("function");
  });
});
