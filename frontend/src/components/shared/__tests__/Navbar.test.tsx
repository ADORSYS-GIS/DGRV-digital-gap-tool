import { describe, it, expect } from "vitest";
import { Navbar } from "../Navbar";

describe("Navbar Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(Navbar).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof Navbar).toBe("function");
  });
});
