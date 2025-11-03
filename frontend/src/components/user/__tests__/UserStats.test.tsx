import { render, screen } from "@testing-library/react";
import { UserStats } from "../UserStats";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

describe("UserStats", () => {
  it("renders the user stats with the correct content", () => {
    render(
      <UserStats totalAssessments={10} completionRate={80} averageScore={90} />,
    );

    expect(screen.getByText("Total Assessments")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });
});
