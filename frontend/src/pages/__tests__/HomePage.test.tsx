import { describe, it, expect } from "vitest";
import { Welcome } from "../HomePage";

describe("Welcome Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(Welcome).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof Welcome).toBe("function");
  });
});
