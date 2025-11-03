import { render, screen, fireEvent } from "@/utils/test-utils";
import { OrganizationCard } from "../OrganizationCard";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { useDeleteOrganization } from "@/hooks/organizations/useDeleteOrganization";
import { Organization } from "@/types/organization";

vi.mock("@/hooks/organizations/useDeleteOrganization", () => ({
  useDeleteOrganization: vi.fn(),
}));

describe("OrganizationCard", () => {
  it("renders the card and handles delete correctly", () => {
    const mutate = vi.fn();
    (useDeleteOrganization as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
    });

    const organization: Organization = {
      id: "1",
      name: "Test Organization",
      domain: "test.com",
      syncStatus: "synced",
    };

    render(<OrganizationCard organization={organization} />);

    expect(screen.getByText("Test Organization")).toBeInTheDocument();
    expect(screen.getByText("test.com")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(screen.getByText("Continue"));

    expect(mutate).toHaveBeenCalledWith("1");
  });
});
