import { describe, it, expect } from "vitest";
import { ROLES } from "../roles";

describe("ROLES Constant", () => {
  it("should exist and be importable", () => {
    // This test verifies that the constant can be imported without errors
    expect(ROLES).toBeDefined();
  });

  it("should have expected role values", () => {
    // Check that ROLES has the expected properties
    expect(ROLES.ADMIN).toBe("dgrv_admin");
    expect(ROLES.ORG_USER).toBe("org_user");
  });
});
