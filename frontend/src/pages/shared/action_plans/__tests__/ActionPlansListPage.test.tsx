import { render, screen } from "@testing-library/react";
import ActionPlansListPage from "../ActionPlansListPage";
import "@testing-library/jest-dom";
import { useActionPlans } from "@/hooks/action_plans/useActionPlans";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { ActionPlanList } from "@/components/shared/action_plans/ActionPlanList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("@/hooks/action_plans/useActionPlans");
vi.mock("@/hooks/submissions/useSubmissions");
vi.mock("@/components/shared/action_plans/ActionPlanList", () => ({
  ActionPlanList: vi.fn(() => (
    <div data-testid="action-plan-list">Action Plan List</div>
  )),
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseActionPlans = useActionPlans as Mock;
const mockUseSubmissions = useSubmissions as Mock;
const mockActionPlanList = ActionPlanList as Mock;

const mockActionPlansData = [
  { id: "ap1", name: "Action Plan 1" },
  { id: "ap2", name: "Action Plan 2" },
];

const mockAssessmentsData = [
  { id: "assess1", name: "Assessment 1" },
  { id: "assess2", name: "Assessment 2" },
];

describe("ActionPlansListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActionPlans.mockReturnValue({
      data: mockActionPlansData,
      isLoading: false,
      error: null,
    });
    mockUseSubmissions.mockReturnValue({
      data: mockAssessmentsData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading and description", () => {
    render(<ActionPlansListPage />);
    expect(screen.getByText("Action Plans")).toBeInTheDocument();
    expect(
      screen.getByText("View and manage all your action plans"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when action plans are loading", () => {
    mockUseActionPlans.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ActionPlansListPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows loading spinner when assessments are loading", () => {
    mockUseSubmissions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ActionPlansListPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when action plans fail to load", () => {
    const errorMessage = "Failed to load action plans";
    mockUseActionPlans.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ActionPlansListPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("shows error message when assessments fail to load", () => {
    const errorMessage = "Failed to load assessments";
    mockUseSubmissions.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ActionPlansListPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders ActionPlanList when both action plans and assessments are available", () => {
    render(<ActionPlansListPage />);
    expect(screen.getByTestId("action-plan-list")).toBeInTheDocument();
    expect(mockActionPlanList).toHaveBeenCalledWith(
      expect.objectContaining({
        actionPlans: mockActionPlansData,
        assessments: mockAssessmentsData,
      }),
      {},
    );
  });

  test("does not render ActionPlanList if action plans are null", () => {
    mockUseActionPlans.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<ActionPlansListPage />);
    expect(screen.queryByTestId("action-plan-list")).not.toBeInTheDocument();
  });

  test("does not render ActionPlanList if assessments are null", () => {
    mockUseSubmissions.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<ActionPlansListPage />);
    expect(screen.queryByTestId("action-plan-list")).not.toBeInTheDocument();
  });
});
