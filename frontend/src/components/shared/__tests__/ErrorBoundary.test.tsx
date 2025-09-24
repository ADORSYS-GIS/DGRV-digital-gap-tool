import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

describe("ErrorBoundary Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(ErrorBoundary).toBeDefined();
  });

  it("should be a class component", () => {
    // Since ErrorBoundary is a class component, we can check its type
    expect(typeof ErrorBoundary).toBe("function");
  });
});
