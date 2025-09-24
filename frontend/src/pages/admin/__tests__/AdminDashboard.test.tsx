import { describe, it, expect } from "vitest";
import AdminDashboard from "../AdminDashboard";

describe("AdminDashboard Component", () => {
  it("should exist and be importable", () => {
    // This test verifies that the component can be imported without errors
    expect(AdminDashboard).toBeDefined();
  });

  it("should be a functional component", () => {
    // Check that the component is a function
    expect(typeof AdminDashboard).toBe("function");
  });
});
