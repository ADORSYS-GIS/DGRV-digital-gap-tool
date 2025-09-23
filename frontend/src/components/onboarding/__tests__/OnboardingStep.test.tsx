import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OnboardingStep from "../OnboardingStep";
import { BarChart3 } from "lucide-react";

describe("OnboardingStep", () => {
  const mockStep = {
    icon: BarChart3,
    title: "Test Title",
    titleHighlight: "Highlight",
    description: "Test description.",
    color: "text-blue-600",
  };

  it("renders the step content correctly", () => {
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={0}
        totalSteps={3}
        handlePrevious={vi.fn()}
        handleNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Highlight")).toBeInTheDocument();
    expect(screen.getByText("Test description.")).toBeInTheDocument();
  });

  it('disables the "Previous" button on the first step', () => {
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={0}
        totalSteps={3}
        handlePrevious={vi.fn()}
        handleNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it('enables the "Previous" button on subsequent steps', () => {
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={1}
        totalSteps={3}
        handlePrevious={vi.fn()}
        handleNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Previous")).not.toBeDisabled();
  });

  it('calls "handleNext" when the "Next" button is clicked', () => {
    const handleNext = vi.fn();
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={0}
        totalSteps={3}
        handlePrevious={vi.fn()}
        handleNext={handleNext}
      />,
    );

    fireEvent.click(screen.getByText("Next"));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('calls "handlePrevious" when the "Previous" button is clicked', () => {
    const handlePrevious = vi.fn();
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={1}
        totalSteps={3}
        handlePrevious={handlePrevious}
        handleNext={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Previous"));
    expect(handlePrevious).toHaveBeenCalledTimes(1);
  });

  it('displays "Finish" on the last step', () => {
    render(
      <OnboardingStep
        step={mockStep}
        isTransitioning={false}
        currentStep={2}
        totalSteps={3}
        handlePrevious={vi.fn()}
        handleNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Finish")).toBeInTheDocument();
  });
});
