import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, useLocation, useParams } from "react-router-dom";
import ManageSubmissionsPage from "../ManageSubmissionsPage";
import "@testing-library/jest-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useLocation: vi.fn(),
    useParams: vi.fn(),
  };
});
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/components/shared/submissions/SubmissionList", () => ({
  SubmissionList: vi.fn(() => (
    <div data-testid="submission-list">Submission List</div>
  )),
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock("@/hooks/submissions/useSubmissionsByOrganization");
vi.mock("@/hooks/submissions/useSubmissionsByCooperation");

// Cast mocked functions to Mock type
const mockUseLocation = useLocation as Mock;
const mockUseParams = useParams as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockUseSubmissionsByOrganization = useSubmissionsByOrganization as Mock;
const mockUseSubmissionsByCooperation = useSubmissionsByCooperation as Mock;
const mockSubmissionList = SubmissionList as Mock;

const mockOrgSubmissions = [{ id: "orgSub1", name: "Org Submission 1" }];
const mockCoopSubmissions = [{ id: "coopSub1", name: "Coop Submission 1" }];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ManageSubmissionsPage />
    </BrowserRouter>,
  );

describe("ManageSubmissionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } }); // Default to Org Admin
    mockUseOrganizationId.mockReturnValue("org123");
    mockUseCooperationId.mockReturnValue(null);
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({
      pathname: "/admin/submissions",
      state: {},
    });
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: mockOrgSubmissions,
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders 'My Submissions' heading for general view", () => {
    renderComponent();
    expect(screen.getByText("My Submissions")).toBeInTheDocument();
  });

  test("renders 'Submission Details' heading when assessmentId is present", () => {
    mockUseParams.mockReturnValue({ assessmentId: "assess1" });
    renderComponent();
    expect(screen.getByText("Submission Details")).toBeInTheDocument();
  });

  test("shows loading spinner when org submissions are loading", () => {
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows loading spinner when coop submissions are loading", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when org submissions fail to load", () => {
    const errorMessage = "Failed to load org submissions";
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByText("Error loading submissions")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("shows error message when coop submissions fail to load", () => {
    const errorMessage = "Failed to load coop submissions";
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByText("Error loading submissions")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renders SubmissionList for Org Admin", () => {
    renderComponent();
    expect(screen.getByTestId("submission-list")).toBeInTheDocument();
    expect(mockSubmissionList).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: mockOrgSubmissions,
        basePath: "/admin",
      }),
      {},
    );
  });

  test("renders SubmissionList for Coop User", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: mockCoopSubmissions,
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(screen.getByTestId("submission-list")).toBeInTheDocument();
    expect(mockSubmissionList).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: mockCoopSubmissions,
        basePath: "/admin",
      }),
      {},
    );
  });

  test("shows empty state message when no submissions for assessmentId", () => {
    mockUseParams.mockReturnValue({ assessmentId: "assess1" });
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(
      screen.getByText("No submission found for this assessment."),
    ).toBeInTheDocument();
  });

  test("shows empty state message for Org Admin with no submissions", () => {
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(
      screen.getByText(
        "No submission found for this assessment in your organization.",
      ),
    ).toBeInTheDocument();
  });

  test("shows empty state message for Coop User with no submissions", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });
    renderComponent();
    expect(
      screen.getByText(
        "No submission found for this assessment in your cooperation.",
      ),
    ).toBeInTheDocument();
  });

  test("shows access denied if user has no valid role", () => {
    mockUseAuth.mockReturnValue({ user: { roles: ["some_other_role"] } });
    renderComponent();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You don't have permission to view submissions. Please contact your administrator.",
      ),
    ).toBeInTheDocument();
  });

  test("calls refetch on retry button click for Org Admin", async () => {
    const mockRefetchOrg = vi.fn();
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Failed"),
      isFetching: false,
      refetch: mockRefetchOrg,
    });
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(mockRefetchOrg).toHaveBeenCalledTimes(1);
    });
  });

  test("calls refetch on retry button click for Coop User", async () => {
    const mockRefetchCoop = vi.fn();
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Failed"),
      isFetching: false,
      refetch: mockRefetchCoop,
    });
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(mockRefetchCoop).toHaveBeenCalledTimes(1);
    });
  });
});
