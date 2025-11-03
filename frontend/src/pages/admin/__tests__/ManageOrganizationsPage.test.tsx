import { render, screen } from "@/utils/test-utils";
import ManageOrganizationsPage from "../ManageOrganizationsPage";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";

vi.mock("@/hooks/organizations/useOrganizations", () => ({
  useOrganizations: vi.fn(),
}));

describe("ManageOrganizationsPage", () => {
  it("renders the page with a list of organizations", () => {
    (useOrganizations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        { id: "1", name: "Org 1", domain: "org1.com", syncStatus: "synced" },
        { id: "2", name: "Org 2", domain: "org2.com", syncStatus: "synced" },
      ],
      isLoading: false,
      error: null,
    });

    render(<ManageOrganizationsPage />);

    expect(screen.getByText("Manage Organizations")).toBeInTheDocument();
    expect(screen.getByText("Org 1")).toBeInTheDocument();
    expect(screen.getByText("Org 2")).toBeInTheDocument();
  });

  it("renders a loading spinner while fetching organizations", () => {
    (useOrganizations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<ManageOrganizationsPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders an error message if fetching organizations fails", () => {
    (useOrganizations as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<ManageOrganizationsPage />);

    expect(
      screen.getByText("Error loading organizations: Failed to fetch"),
    ).toBeInTheDocument();
  });
});
