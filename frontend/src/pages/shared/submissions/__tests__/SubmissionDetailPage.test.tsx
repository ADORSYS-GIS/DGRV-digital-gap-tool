import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import SubmissionDetailPage from "../SubmissionDetailPage";
import "@testing-library/jest-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useSubmissionSummary } from "@/hooks/submissions/useSubmissionSummary";
import { useSubmissionSummaryByOrganization } from "@/hooks/submissions/useSubmissionSummaryByOrganization";
import { useSubmissionSummaryByCooperation } from "@/hooks/submissions/useSubmissionSummaryByCooperation";
import { SubmissionDetail } from "@/components/shared/submissions/SubmissionDetail";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
  };
});
vi.mock("@/context/AuthContext");
vi.mock("@/constants/roles");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/hooks/submissions/useSubmissionSummary");
vi.mock("@/hooks/submissions/useSubmissionSummaryByOrganization");
vi.mock("@/hooks/submissions/useSubmissionSummaryByCooperation");
vi.mock("@/components/shared/submissions/SubmissionDetail", () => ({
  SubmissionDetail: vi.fn(() => (
    <div data-testid="submission-detail">Submission Detail</div>
  )),
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseParams = useParams as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockUseSubmissionSummary = useSubmissionSummary as Mock;
const mockUseSubmissionSummaryByOrganization =
  useSubmissionSummaryByOrganization as Mock;
const mockUseSubmissionSummaryByCooperation =
  useSubmissionSummaryByCooperation as Mock;
const mockSubmissionDetail = SubmissionDetail as Mock;
const mockLoadingSpinner = LoadingSpinner as Mock;

const mockSubmissionData = {
  id: "sub1",
  assessmentName: "Test Assessment",
  organizationName: "Test Org",
  cooperationName: "Test Coop",
  dimensions: [],
  overallScore: 80,
  status: "Completed",
};

describe("SubmissionDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ submissionId: "sub1" });
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ADMIN] } });
    mockUseOrganizationId.mockReturnValue("org123");
    mockUseCooperationId.mockReturnValue("coop123");

    // Default mock values for hooks
    mockUseSubmissionSummary.mockReturnValue({
      data: mockSubmissionData,
      isLoading: false,
      error: null,
    });
    mockUseSubmissionSummaryByOrganization.mockReturnValue({
      data: mockSubmissionData,
      isLoading: false,
      error: null,
    });
    mockUseSubmissionSummaryByCooperation.mockReturnValue({
      data: mockSubmissionData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading spinner when data is loading", () => {
    mockUseSubmissionSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<SubmissionDetailPage />);
    expect(mockLoadingSpinner).toHaveBeenCalledTimes(1);
  });

  test("renders error message when there is an error", () => {
    const errorMessage = "Failed to load submission summary";
    mockUseSubmissionSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<SubmissionDetailPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders SubmissionDetail component with data for ADMIN role", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ADMIN] } });
    render(<SubmissionDetailPage />);
    expect(mockSubmissionDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: mockSubmissionData,
      }),
      {},
    );
  });

  test("renders SubmissionDetail component with data for ORG_ADMIN role", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<SubmissionDetailPage />);
    expect(mockUseSubmissionSummaryByOrganization).toHaveBeenCalledWith(
      "sub1",
      "org123",
      expect.objectContaining({ enabled: true }),
    );
    expect(mockSubmissionDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: mockSubmissionData,
      }),
      {},
    );
  });

  test("renders SubmissionDetail component with data for COOP_ADMIN role", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_ADMIN] } });
    render(<SubmissionDetailPage />);
    expect(mockUseSubmissionSummaryByCooperation).toHaveBeenCalledWith(
      "sub1",
      "coop123",
      expect.objectContaining({ enabled: true }),
    );
    expect(mockSubmissionDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: mockSubmissionData,
      }),
      {},
    );
  });

  test("renders SubmissionDetail component with data for COOP_USER role", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    render(<SubmissionDetailPage />);
    expect(mockUseSubmissionSummaryByCooperation).toHaveBeenCalledWith(
      "sub1",
      "coop123",
      expect.objectContaining({ enabled: true }),
    );
    expect(mockSubmissionDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: mockSubmissionData,
      }),
      {},
    );
  });

  test("does not render SubmissionDetail if summary is null", () => {
    mockUseSubmissionSummary.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<SubmissionDetailPage />);
    expect(screen.queryByTestId("submission-detail")).not.toBeInTheDocument();
  });

  test("useSubmissionSummary is called by default if no specific role hook is enabled", () => {
    mockUseAuth.mockReturnValue({ user: { roles: ["some_other_role"] } });
    mockUseOrganizationId.mockReturnValue(null);
    mockUseCooperationId.mockReturnValue(null);
    render(<SubmissionDetailPage />);
    expect(mockUseSubmissionSummary).toHaveBeenCalledWith("sub1");
    expect(mockUseSubmissionSummaryByOrganization).toHaveBeenCalledWith(
      "sub1",
      null,
      expect.objectContaining({ enabled: false }),
    );
    expect(mockUseSubmissionSummaryByCooperation).toHaveBeenCalledWith(
      "sub1",
      null,
      expect.objectContaining({ enabled: false }),
    );
  });
});
