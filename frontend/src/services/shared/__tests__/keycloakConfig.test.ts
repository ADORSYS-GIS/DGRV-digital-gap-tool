import { describe, it, expect } from "vitest";
import {
  keycloak,
  keycloakConfig,
  keycloakInitOptions,
} from "../keycloakConfig";

describe("keycloakConfig", () => {
  it("should exist and be importable", () => {
    // This test verifies that the config can be imported without errors
    expect(keycloak).toBeDefined();
    expect(keycloakConfig).toBeDefined();
    expect(keycloakInitOptions).toBeDefined();
  });

  it("should have expected configuration properties", () => {
    // Check that keycloakConfig has the expected properties
    expect(keycloakConfig.url).toBeDefined();
    expect(keycloakConfig.realm).toBeDefined();
    expect(keycloakConfig.clientId).toBeDefined();

    // Check that keycloakInitOptions has the expected properties
    expect(keycloakInitOptions.onLoad).toBeDefined();
    expect(keycloakInitOptions.pkceMethod).toBeDefined();
    expect(keycloakInitOptions.checkLoginIframe).toBeDefined();
    expect(keycloakInitOptions.enableLogging).toBeDefined();
    expect(keycloakInitOptions.silentCheckSsoRedirectUri).toBeDefined();
  });
});
