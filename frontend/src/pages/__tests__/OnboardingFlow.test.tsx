import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OnboardingFlow from "../OnboardingFlow";
import * as AuthContext from "@/context/AuthContext";

vi.mock("@/context/AuthContext");

describe("OnboardingFlow", () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { sub: "test-user" },
      isAuthenticated: true,
      roles: [],
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
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
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /previous/i }));
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
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText("Define Your Future")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText("Analyze Results &")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    await waitFor(() => {
      expect(
        screen.getByText("You're Ready to Get Started!"),
      ).toBeInTheDocument();
    });
  });
});
