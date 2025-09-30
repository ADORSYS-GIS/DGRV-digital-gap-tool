import { describe, it, expect } from "vitest";
import {
  LoadingSpinner,
  FullPageLoader,
  InlineLoader,
} from "../LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the components can be imported without errors
    expect(LoadingSpinner).toBeDefined();
    expect(FullPageLoader).toBeDefined();
    expect(InlineLoader).toBeDefined();
  });

  it("should be functions", () => {
    // Check that all components are functions
    expect(typeof LoadingSpinner).toBe("function");
    expect(typeof FullPageLoader).toBe("function");
    expect(typeof InlineLoader).toBe("function");
  });
});
