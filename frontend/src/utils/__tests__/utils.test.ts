import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("Utils Functions", () => {
  it("should exist and be importable", () => {
    // This test verifies that the function can be imported without errors
    expect(cn).toBeDefined();
  });

  it("should be a function", () => {
    // Check that cn is a function
    expect(typeof cn).toBe("function");
  });
});
