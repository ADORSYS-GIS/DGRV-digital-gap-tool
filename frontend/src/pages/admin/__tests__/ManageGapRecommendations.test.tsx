import { render, screen } from "@testing-library/react";
import ManageGapRecommendations from "../ManageGapRecommendations";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("ManageGapRecommendations", () => {
  it("renders the page with the correct title", () => {
    render(<ManageGapRecommendations />);

    expect(screen.getByText("Manage Gap Recommendations")).toBeInTheDocument();
  });
});
