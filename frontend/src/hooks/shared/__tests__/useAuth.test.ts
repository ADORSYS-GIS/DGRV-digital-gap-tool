import { describe, it, expect } from "vitest";
import { useAuth } from "../useAuth";

describe("useAuth Hook", () => {
  it("should exist and be importable", () => {
    // This test verifies that the hook can be imported without errors
    expect(useAuth).toBeDefined();
  });

  it("should be a function", () => {
    // Check that useAuth is a function
    expect(typeof useAuth).toBe("function");
  });
});
