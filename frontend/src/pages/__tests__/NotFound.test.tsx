import { describe, it, expect } from "vitest";
import NotFound from "../NotFound";

describe("NotFound Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(NotFound).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof NotFound).toBe("function");
  });
});
