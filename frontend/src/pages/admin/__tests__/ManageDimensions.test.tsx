import { render, screen } from "@testing-library/react";
import ManageDimensions from "../ManageDimensions";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("ManageDimensions", () => {
  it("renders the page with the correct title", () => {
    render(<ManageDimensions />);

    expect(screen.getByText("Manage Dimensions")).toBeInTheDocument();
  });
});
