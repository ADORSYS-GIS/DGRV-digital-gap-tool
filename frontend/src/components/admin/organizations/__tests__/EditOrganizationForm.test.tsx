import { render, screen, fireEvent } from "@testing-library/react";
import { EditOrganizationForm } from "../EditOrganizationForm";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { useUpdateOrganization } from "@/hooks/organizations/useUpdateOrganization";
import { Organization } from "@/types/organization";

vi.mock("@/hooks/organizations/useUpdateOrganization", () => ({
  useUpdateOrganization: vi.fn(),
}));

describe("EditOrganizationForm", () => {
  it("renders the form and submits data correctly", () => {
    const mutate = vi.fn();
    (useUpdateOrganization as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });

    const organization: Organization = {
      id: "1",
      name: "Test Organization",
      domain: "test.com",
      syncStatus: "synced",
    };

    render(<EditOrganizationForm organization={organization} />);

    fireEvent.click(screen.getByText("Edit"));

    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "Updated Organization" },
    });
    fireEvent.change(screen.getByLabelText("Domain"), {
      target: { value: "updated.com" },
    });

    fireEvent.click(screen.getByText("Save Changes"));
  });
});
