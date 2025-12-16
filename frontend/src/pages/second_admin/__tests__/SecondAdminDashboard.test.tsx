import { render, screen } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import SecondAdminDashboard from "../SecondAdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/hooks/organizations/useOrganizationId", () => ({
  useOrganizationId: vi.fn(),
}));
vi.mock("@/hooks/submissions/useSubmissionsByOrganization", () => ({
  useSubmissionsByOrganization: vi.fn(),
}));

const mockedUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockedUseOrganizationId = useOrganizationId as unknown as ReturnType<
  typeof vi.fn
>;
const mockedUseSubmissionsByOrganization =
  useSubmissionsByOrganization as unknown as ReturnType<typeof vi.fn>;

describe("SecondAdminDashboard", () => {
  it("renders dashboard header and primary cards", () => {
    mockedUseAuth.mockReturnValue({
      user: { name: "Test Admin" },
    });
    mockedUseOrganizationId.mockReturnValue("org-1");
    mockedUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<SecondAdminDashboard />);

    expect(
      screen.getByText(/cooperative management dashboard/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /manage cooperatives/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/manage users/i)).toBeInTheDocument();
    expect(screen.getByText(/create assessment/i)).toBeInTheDocument();
  });
});
