import { describe, it, expect } from "vitest";
import AppRouter from "../AppRouter";

describe("AppRouter Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(AppRouter).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof AppRouter).toBe("function");
  });
});
