import { render, screen } from "@testing-library/react";
import ManageActionPlan from "../ManageActionPlan";
import "@testing-library/jest-dom";

describe("ManageActionPlan", () => {
  test("renders the Manage Action Plan heading", () => {
    render(<ManageActionPlan />);
    expect(screen.getByText("Manage Action Plan")).toBeInTheDocument();
  });

  test("renders the descriptive paragraph", () => {
    render(<ManageActionPlan />);
    expect(
      screen.getByText("This is where you will manage the action plan."),
    ).toBeInTheDocument();
  });
});
