import { render, screen } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ManageAssessments from "../ManageAssessments";
import { useAssessmentsByOrganization } from "@/hooks/assessments/useAssessmentsByOrganization";
import { useAssessmentsByCooperation } from "@/hooks/assessments/useAssessmentsByCooperation";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useCooperations } from "@/hooks/cooperations/useCooperations";

vi.mock("@/hooks/assessments/useAssessmentsByOrganization", () => ({
  useAssessmentsByOrganization: vi.fn(),
}));
vi.mock("@/hooks/assessments/useAssessmentsByCooperation", () => ({
  useAssessmentsByCooperation: vi.fn(),
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
vi.mock("@/hooks/organization_dimensions/useOrganizationDimensions", () => ({
  useOrganizationDimensions: vi.fn(),
}));
vi.mock("@/hooks/cooperations/useCooperations", () => ({
  useCooperations: vi.fn(),
}));

const mockedUseAssessmentsByOrganization =
  useAssessmentsByOrganization as unknown as ReturnType<typeof vi.fn>;
const mockedUseAssessmentsByCooperation =
  useAssessmentsByCooperation as unknown as ReturnType<typeof vi.fn>;
const mockedUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockedUseOrganizationId =
  useOrganizationId as unknown as ReturnType<typeof vi.fn>;
const mockedUseCooperationId =
  useCooperationId as unknown as ReturnType<typeof vi.fn>;
const mockedUseOrganizationDimensions =
  useOrganizationDimensions as unknown as ReturnType<typeof vi.fn>;
const mockedUseCooperations =
  useCooperations as unknown as ReturnType<typeof vi.fn>;

describe("ManageAssessments", () => {
  it("renders assessments list for org admin", () => {
    mockedUseAuth.mockReturnValue({
      user: { roles: ["org_admin"] },
    });
    mockedUseOrganizationId.mockReturnValue("org-1");
    mockedUseCooperationId.mockReturnValue(undefined);
    mockedUseOrganizationDimensions.mockReturnValue({
      data: ["dim-1"],
      isLoading: false,
    });
    mockedUseCooperations.mockReturnValue({
      data: [{ id: "coop-1", name: "Coop One", description: "", domains: [] }],
    });
    mockedUseAssessmentsByOrganization.mockReturnValue({
      data: [
        {
          id: "assess-1",
          name: "Test Assessment",
          dimensionIds: ["dim-1"],
          syncStatus: "synced",
        },
      ],
      isLoading: false,
      error: null,
    });
    mockedUseAssessmentsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ManageAssessments />);

    expect(screen.getByText(/manage assessments/i)).toBeInTheDocument();
    expect(screen.getByText(/test assessment/i)).toBeInTheDocument();
  });
});
