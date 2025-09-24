import { describe, it, expect } from "vitest";
import { ProtectedRoute } from "../ProtectedRoute";

describe("ProtectedRoute Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(ProtectedRoute).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof ProtectedRoute).toBe("function");
  });
});
