import { describe, it, expect } from "vitest";
import { HomePage } from "../HomePage";

describe("HomePage Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(HomePage).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof HomePage).toBe("function");
  });
});
