import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OnboardingCompletion from "../OnboardingCompletion";

describe("OnboardingCompletion", () => {
  it("renders the completion screen correctly", () => {
    render(
      <OnboardingCompletion
        isTransitioning={false}
        handleGetStarted={vi.fn()}
        handlePrevious={vi.fn()}
      />,
    );

    expect(
      screen.getByText("You're Ready to Get Started!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your digitalization journey begins now. Let's transform your cooperative with data-driven insights and strategic planning.",
      ),
    ).toBeInTheDocument();
  });

  it('calls "handleGetStarted" when the "Begin Your Journey" button is clicked', () => {
    const handleGetStarted = vi.fn();
    render(
      <OnboardingCompletion
        isTransitioning={false}
        handleGetStarted={handleGetStarted}
        handlePrevious={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Begin Your Journey"));
    expect(handleGetStarted).toHaveBeenCalledTimes(1);
  });

  it('calls "handlePrevious" when the "Back to steps" button is clicked', () => {
    const handlePrevious = vi.fn();
    render(
      <OnboardingCompletion
        isTransitioning={false}
        handleGetStarted={vi.fn()}
        handlePrevious={handlePrevious}
      />,
    );

    fireEvent.click(screen.getByText("Back to steps"));
    expect(handlePrevious).toHaveBeenCalledTimes(1);
  });
});
