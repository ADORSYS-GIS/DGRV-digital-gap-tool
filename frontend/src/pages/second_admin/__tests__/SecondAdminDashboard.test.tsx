import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SecondAdminDashboard from "../SecondAdminDashboard";
import "@testing-library/jest-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Link: vi.fn(({ to, children }) => <a href={to as string}>{children}</a>),
  };
});
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/hooks/submissions/useSubmissionsByOrganization");
vi.mock("@/components/shared/DashboardCard", () => ({
  DashboardCard: vi.fn(({ title, description }) => (
    <div
      data-testid={`dashboard-card-${title.replace(/\s/g, "-").toLowerCase()}`}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )),
}));
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
vi.mock("@/hooks/reports/useDownloadReportByAssessment");

// Cast mocked functions to Mock type
const mockUseAuth = useAuth as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockUseSubmissionsByOrganization = useSubmissionsByOrganization as Mock;
const mockDashboardCard = DashboardCard as Mock;
const mockSubmissionList = SubmissionList as Mock;
const mockUseDownloadReportByAssessment = useDownloadReportByAssessment as Mock;

const mockUser = {
  name: "Test Admin",
  preferred_username: "testadmin",
};

const mockSubmissionsData = [
  { assessment: { assessment_id: "assessment1" }, name: "Submission One" },
  { assessment: { assessment_id: "assessment2" }, name: "Submission Two" },
];

const queryClient = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SecondAdminDashboard />
      </BrowserRouter>
    </QueryClientProvider>,
  );

describe("SecondAdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseOrganizationId.mockReturnValue("org123");
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: mockSubmissionsData,
      isLoading: false,
      error: null,
    });
    mockUseDownloadReportByAssessment.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders welcome header with user's name", () => {
    renderComponent();
    expect(screen.getByText(/Welcome back, Test Admin./i)).toBeInTheDocument();
  });

  test("renders welcome header with preferred username if name is not available", () => {
    mockUseAuth.mockReturnValue({ user: { preferred_username: "testuser" } });
    renderComponent();
    expect(screen.getByText(/Welcome back, testuser./i)).toBeInTheDocument();
  });

  test("renders welcome header with 'Administrator' if no user name is available", () => {
    mockUseAuth.mockReturnValue({ user: { roles: ["admin"] } }); // No name or preferred_username
    renderComponent();
    expect(
      screen.getByText(/Welcome back, Administrator./i),
    ).toBeInTheDocument();
  });

  test("renders all dashboard cards with correct titles and descriptions", () => {
    renderComponent();
    expect(
      screen.getByTestId("dashboard-card-manage-cooperations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manage Cooperations")).toBeInTheDocument();
    expect(
      screen.getByText("Administer cooperative profiles and data"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-manage-users"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(
      screen.getByText("Oversee user accounts and permissions"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-create-assesment"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create Assesment")).toBeInTheDocument();
    expect(
      screen.getByText("Design and deploy new assessments"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-view-action-plan"),
    ).toBeInTheDocument();
    expect(screen.getByText("View Action Plan")).toBeInTheDocument();
    expect(
      screen.getByText("Review and monitor strategic action plans"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-view-submissions"),
    ).toBeInTheDocument();
    expect(screen.getByText("View Submissions")).toBeInTheDocument();
    expect(
      screen.getByText("Track and evaluate assessment submissions"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when submissions are loading", () => {
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    renderComponent();
    expect(screen.getAllByTestId("loading-spinner").length).toBeGreaterThan(0); // Should be two spinners
  });

  test("shows error message when submissions fail to load", () => {
    const errorMessage = "Failed to load submissions";
    mockUseSubmissionsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    renderComponent();
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("calls useSubmissionsByOrganization with correct parameters", () => {
    renderComponent();
    expect(mockUseSubmissionsByOrganization).toHaveBeenCalledWith("org123", {
      enabled: true,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    });
  });

  test("does not call useSubmissionsByOrganization if organizationId is null", () => {
    mockUseOrganizationId.mockReturnValue(null);
    renderComponent();
    expect(mockUseSubmissionsByOrganization).toHaveBeenCalledWith("", {
      enabled: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    });
  });
});
