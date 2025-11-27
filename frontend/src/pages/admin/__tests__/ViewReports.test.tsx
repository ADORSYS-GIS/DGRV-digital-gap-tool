import { render, screen } from "@testing-library/react";
import ViewReports from "../ViewReports";
import "@testing-library/jest-dom";

describe("ViewReports", () => {
  test("renders the View Reports heading", () => {
    render(<ViewReports />);
    expect(screen.getByText("View Reports")).toBeInTheDocument();
  });

  test("renders the descriptive paragraph", () => {
    render(<ViewReports />);
    expect(
      screen.getByText("This is where you will view reports."),
    ).toBeInTheDocument();
  });
});
