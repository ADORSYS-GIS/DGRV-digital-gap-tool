import { render, screen } from "@testing-library/react";
import ManageGapRecommendations from "../ManageGapRecommendations";
import "@testing-library/jest-dom";

describe("ManageGapRecommendations", () => {
  test("renders the Manage Gap Recommendations heading", () => {
    render(<ManageGapRecommendations />);
    expect(screen.getByText("Manage Gap Recommendations")).toBeInTheDocument();
  });

  test("renders the descriptive paragraph", () => {
    render(<ManageGapRecommendations />);
    expect(
      screen.getByText("Gap recommendations management page."),
    ).toBeInTheDocument();
  });
});
