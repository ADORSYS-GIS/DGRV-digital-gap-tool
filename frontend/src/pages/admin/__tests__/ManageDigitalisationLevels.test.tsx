import { render, screen } from "@testing-library/react";
import ManageDigitalisationLevels from "../ManageDigitalisationLevels";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("ManageDigitalisationLevels", () => {
  it("renders the page with the correct title", () => {
    render(<ManageDigitalisationLevels />);

    expect(
      screen.getByText("Manage Digitalisation Levels"),
    ).toBeInTheDocument();
  });
});
