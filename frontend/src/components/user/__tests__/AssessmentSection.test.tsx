import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentSection } from "../AssessmentSection";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";

describe("AssessmentSection", () => {
  it("renders the quick actions card when there is no current assessment", () => {
    const onStartAssessment = vi.fn();
    const onContinueAssessment = vi.fn();

    render(
      <AssessmentSection
        currentAssessment={null}
        onStartAssessment={onStartAssessment}
        onContinueAssessment={onContinueAssessment}
      />,
    );

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Start New Assessment"));
    expect(onStartAssessment).toHaveBeenCalled();
  });

  it("renders the current assessment card when there is a current assessment", () => {
    const onStartAssessment = vi.fn();
    const onContinueAssessment = vi.fn();

    const currentAssessment = {
      title: "Test Assessment",
      progress: 5,
      total: 10,
      lastUpdated: "2023-10-27",
    };

    render(
      <AssessmentSection
        currentAssessment={currentAssessment}
        onStartAssessment={onStartAssessment}
        onContinueAssessment={onContinueAssessment}
      />,
    );

    expect(screen.getByText("Current Assessment")).toBeInTheDocument();
    expect(screen.getByText("Test Assessment")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    expect(onContinueAssessment).toHaveBeenCalled();
  });
});
