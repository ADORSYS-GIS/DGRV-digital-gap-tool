import { render, screen } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ManageCooperationUsers from "../ManageCooperationUsers";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";

vi.mock("@/hooks/cooperations/useCooperations", () => ({
  useCooperations: vi.fn(),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/hooks/organizations/useOrganizationId", () => ({
  useOrganizationId: vi.fn(),
}));
vi.mock("@/hooks/cooperations/useCooperationId", () => ({
  useCooperationId: vi.fn(),
}));

const mockedUseCooperations = useCooperations as unknown as ReturnType<
  typeof vi.fn
>;
const mockedUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockedUseOrganizationId = useOrganizationId as unknown as ReturnType<
  typeof vi.fn
>;
const mockedUseCooperationId = useCooperationId as unknown as ReturnType<
  typeof vi.fn
>;

describe("ManageCooperationUsers", () => {
  it("renders cooperation selection grid for org admin", () => {
    mockedUseAuth.mockReturnValue({
      user: { roles: ["org_admin"] },
    });
    mockedUseOrganizationId.mockReturnValue("org-1");
    mockedUseCooperationId.mockReturnValue(undefined);
    mockedUseCooperations.mockReturnValue({
      data: [
        { id: "c1", name: "Coop One", description: "Desc", domains: [] },
      ],
      isLoading: false,
      error: null,
    });

    render(<ManageCooperationUsers />);

    expect(
      screen.getByText(/select a cooperation to manage users/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/coop one/i)).toBeInTheDocument();
  });
});
