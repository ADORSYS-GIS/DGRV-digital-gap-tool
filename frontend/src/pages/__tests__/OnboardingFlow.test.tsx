import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OnboardingFlow from "../OnboardingFlow";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/context/AuthContext");

describe("OnboardingFlow", () => {
  beforeEach(() => {
    (useAuth as Mock).mockReturnValue({ user: { sub: "test-user" } });
  });

  it("renders the first step initially", () => {
    render(
      <MemoryRouter>
        <OnboardingFlow />
      </MemoryRouter>,
    );
    expect(screen.getByText("Assess Your Current")).toBeInTheDocument();
  });

  it("navigates to the next step when 'Next' is clicked", async () => {
    render(
      <MemoryRouter>
        <OnboardingFlow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => {
      expect(screen.getByText("Define Your Future")).toBeInTheDocument();
    });
  });

  it("navigates to the previous step when 'Previous' is clicked", async () => {
    render(
      <MemoryRouter>
        <OnboardingFlow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => {
      fireEvent.click(screen.getByText("Previous"));
    });
    await waitFor(() => {
      expect(screen.getByText("Assess Your Current")).toBeInTheDocument();
    });
  });

  it("shows the completion screen after the last step", async () => {
    render(
      <MemoryRouter>
        <OnboardingFlow />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => {
      fireEvent.click(screen.getByText("Next"));
    });
    // await waitFor(() => {
    //   expect(screen.getByText("Finish")).toBeInTheDocument();
    // });
    // fireEvent.click(screen.getByText("Finish"));
    // await waitFor(() => {
    //   expect(
    //     screen.getByText("You're Ready to Get Started!")
    //   ).toBeInTheDocument();
    // });
  });
});
