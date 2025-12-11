import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ThirdAdminDashboard from "../ThirdAdminDashboard";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Link: vi.fn(({ to, children }) => <a href={to as string}>{children}</a>),
  };
});
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/hooks/submissions/useSubmissionsByCooperation");
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

// Cast mocked functions to Mock type
const mockUseAuth = useAuth as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockUseSubmissionsByCooperation = useSubmissionsByCooperation as Mock;
const mockDashboardCard = DashboardCard as Mock;
const mockSubmissionList = SubmissionList as Mock;

const mockUser = {
  name: "Third Admin",
  preferred_username: "thirdadmin",
};

const mockSubmissionsData = [
  {
    id: "assessment1",
    name: "Submission One",
    assessment: {
      assessment_id: "assessment1",
      started_at: null,
      completed_at: null,
      dimensions_id: [],
    },
    syncStatus: "synced",
    overall_score: null,
  },
  {
    id: "assessment2",
    name: "Submission Two",
    assessment: {
      assessment_id: "assessment2",
      started_at: null,
      completed_at: null,
      dimensions_id: [],
    },
    syncStatus: "synced",
    overall_score: null,
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThirdAdminDashboard />
      </BrowserRouter>
    </QueryClientProvider>,
  );

describe("ThirdAdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: mockSubmissionsData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders welcome header with user's name", () => {
    renderComponent();
    expect(screen.getByText(/Welcome back, Third Admin./i)).toBeInTheDocument();
  });

  test("renders welcome header with preferred username if name is not available", () => {
    mockUseAuth.mockReturnValue({ user: { preferred_username: "thirduser" } });
    renderComponent();
    expect(screen.getByText(/Welcome back, thirduser./i)).toBeInTheDocument();
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
      screen.getByTestId("dashboard-card-manage-users"),
    ).toBeInTheDocument();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(
      screen.getByText("Administer user accounts and permissions"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-answer-assesment"),
    ).toBeInTheDocument();
    expect(screen.getByText("Answer Assesment")).toBeInTheDocument();
    expect(
      screen.getByText("Fill out and manage assessments"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-view-action-plan"),
    ).toBeInTheDocument();
    expect(screen.getByText("View Action Plan")).toBeInTheDocument();
    expect(
      screen.getByText("Review and track action plans"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("dashboard-card-view-submissions"),
    ).toBeInTheDocument();
    expect(screen.getByText("View Submissions")).toBeInTheDocument();
    expect(
      screen.getByText("Browse and manage all submissions"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when submissions are loading", () => {
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    renderComponent();
    expect(screen.getAllByTestId("loading-spinner").length).toBeGreaterThan(0); // Should be two spinners
  });

  test("shows error message when submissions fail to load", () => {
    const errorMessage = "Failed to load submissions";
    mockUseSubmissionsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    renderComponent();
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("calls useSubmissionsByCooperation with correct parameters", () => {
    renderComponent();
    expect(mockUseSubmissionsByCooperation).toHaveBeenCalledWith("coop123", {
      enabled: true,
    });
  });

  test("does not call useSubmissionsByCooperation if cooperationId is null", () => {
    mockUseCooperationId.mockReturnValue(null);
    renderComponent();
    expect(mockUseSubmissionsByCooperation).toHaveBeenCalledWith("", {
      enabled: false,
    });
  });
});
