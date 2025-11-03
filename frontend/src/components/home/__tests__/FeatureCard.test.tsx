import { render, screen } from "@testing-library/react";
import { FeatureCard } from "../FeatureCard";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("FeatureCard", () => {
  it("renders the feature card with the correct content", () => {
    const icon = <svg data-testid="icon" />;
    const title = "Test Title";
    const description = "Test Description";

    render(<FeatureCard icon={icon} title={title} description={description} />);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
