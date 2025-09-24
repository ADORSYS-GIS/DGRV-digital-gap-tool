import { describe, it, expect } from "vitest";
import Dashboard from "../Dashboard";

describe("Dashboard Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(Dashboard).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof Dashboard).toBe("function");
  });
});
