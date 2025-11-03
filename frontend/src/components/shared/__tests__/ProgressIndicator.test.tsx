import { render, screen } from "@testing-library/react";
import { ProgressIndicator } from "../ProgressIndicator";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("ProgressIndicator", () => {
  it("renders the progress indicator with the correct content and percentage", () => {
    render(<ProgressIndicator current={5} total={10} label="Test Progress" />);

    expect(screen.getByText("Test Progress")).toBeInTheDocument();
    expect(screen.getByText("5/10 (50%)")).toBeInTheDocument();
  });

  it("renders with the correct variant", () => {
    const { container } = render(
      <ProgressIndicator
        current={5}
        total={10}
        label="Test Progress"
        variant="success"
      />,
    );

    expect(container.querySelector(".bg-green-600")).toBeInTheDocument();
  });
});
