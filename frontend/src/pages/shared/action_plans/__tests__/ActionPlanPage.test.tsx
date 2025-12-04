import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import ActionPlanPage from "../ActionPlanPage";
import "@testing-library/jest-dom";
import { useActionPlan } from "@/hooks/action_plans/useActionPlan";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
  };
});
vi.mock("@/hooks/action_plans/useActionPlan");
vi.mock("@/hooks/submissions/useSubmissions");
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock("@/components/shared/action_plans/KanbanBoard", () => ({
  KanbanBoard: vi.fn(() => <div data-testid="kanban-board">Kanban Board</div>),
}));

// Cast mocked functions to Mock type
const mockUseParams = useParams as Mock;
const mockUseActionPlan = useActionPlan as Mock;
const mockUseSubmissions = useSubmissions as Mock;
const mockKanbanBoard = KanbanBoard as Mock;

const mockActionPlanData = {
  id: "ap1",
  name: "Test Action Plan",
  action_items: [],
};

const mockAssessmentsData = [
  { id: "assess1", name: "Test Assessment" },
  { id: "assess2", name: "Another Assessment" },
];

describe("ActionPlanPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ assessmentId: "assess1" });
    mockUseActionPlan.mockReturnValue({
      data: mockActionPlanData,
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

  test("renders heading with assessment name", () => {
    render(<ActionPlanPage />);
    expect(
      screen.getByText("Action Plan for Test Assessment"),
    ).toBeInTheDocument();
  });

  test("renders heading with 'Assessment' if assessmentName is not found", () => {
    mockUseSubmissions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<ActionPlanPage />);
    expect(screen.getByText("Action Plan for Assessment")).toBeInTheDocument();
  });

  test("shows loading spinner when action plan is loading", () => {
    mockUseActionPlan.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<ActionPlanPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows loading spinner when assessments are loading", () => {
    mockUseSubmissions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ActionPlanPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when action plan fails to load", () => {
    const errorMessage = "Failed to load action plan";
    mockUseActionPlan.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ActionPlanPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("shows error message when submissions fail to load", () => {
    const errorMessage = "Failed to load submissions";
    mockUseSubmissions.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ActionPlanPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders KanbanBoard when action plan data is available", () => {
    render(<ActionPlanPage />);
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(mockKanbanBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        actionPlan: mockActionPlanData,
      }),
      {},
    );
  });

  test("does not render KanbanBoard if action plan data is null", () => {
    mockUseActionPlan.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<ActionPlanPage />);
    expect(screen.queryByTestId("kanban-board")).not.toBeInTheDocument();
  });
});
