import { render, screen, fireEvent } from "@/utils/test-utils";
import { AddOrganizationForm } from "../AddOrganizationForm";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { useAddOrganization } from "@/hooks/organizations/useAddOrganization";

vi.mock("@/hooks/organizations/useAddOrganization", () => ({
  useAddOrganization: vi.fn(),
}));

describe("AddOrganizationForm", () => {
  it("renders the form and submits data correctly", () => {
    const mutate = vi.fn();
    (useAddOrganization as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AddOrganizationForm />);

    // Open the dialog
    fireEvent.click(screen.getByRole("button", { name: /add organization/i }));

    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "Test Organization" },
    });
    fireEvent.change(screen.getByLabelText("Domain"), {
      target: { value: "test.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Add Organization" }));
  });
});
