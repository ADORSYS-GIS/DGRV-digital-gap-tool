import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BenefitCard } from "../BenefitCard";
import "@testing-library/jest-dom";

describe("BenefitCard", () => {
  it("renders the benefit card with the correct content", () => {
    const icon = <svg data-testid="icon" />;
    const title = "Test Title";
    const description = "Test Description";

    render(<BenefitCard icon={icon} title={title} description={description} />);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
