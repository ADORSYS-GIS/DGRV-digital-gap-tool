import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressIndicators from "../ProgressIndicators";

describe("ProgressIndicators", () => {
  it("renders the correct number of indicators", () => {
    render(
      <ProgressIndicators totalSteps={3} currentStep={0} isCompleted={false} />,
    );
    const { container } = render(
      <ProgressIndicators totalSteps={3} currentStep={0} isCompleted={false} />,
    );
    const indicators = container.firstChild?.childNodes;
    expect(indicators).toHaveLength(4);
  });

  it("highlights the current step correctly", () => {
    const { container } = render(
      <ProgressIndicators totalSteps={3} currentStep={1} isCompleted={false} />,
    );
    const indicators = container.firstChild?.childNodes;
    expect(indicators?.[1]).toHaveClass("bg-blue-600", "w-8");
  });

  it("marks previous steps as completed", () => {
    const { container } = render(
      <ProgressIndicators totalSteps={3} currentStep={2} isCompleted={false} />,
    );
    const indicators = container.firstChild?.childNodes;
    expect(indicators?.[0]).toHaveClass("bg-green-500", "w-2");
    expect(indicators?.[1]).toHaveClass("bg-green-500", "w-2");
  });

  it("renders correctly in the completed state", () => {
    const { container } = render(
      <ProgressIndicators totalSteps={3} currentStep={3} isCompleted={true} />,
    );
    const indicators = container.firstChild?.childNodes;
    expect(indicators?.[3]).toHaveClass("bg-green-500", "w-8");
  });
});
