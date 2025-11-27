import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import {
  BrowserRouter,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useAssessment } from "@/hooks/assessments/useAssessment";
import { useDimensionWithStates } from "@/hooks/assessments/useDimensionWithStates";
import { useSubmitDimensionAssessment } from "@/hooks/assessments/useSubmitDimensionAssessment";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { calculateGapScore } from "@/utils/gapCalculation";
import { AnswerDimensionAssessmentPage } from "../AnswerDimensionAssessmentPage";
import "@testing-library/jest-dom";
import { Mock } from "vitest";

// Mock all external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/hooks/assessments/useAssessment");
vi.mock("@/hooks/assessments/useDimensionWithStates");
vi.mock("@/hooks/assessments/useSubmitDimensionAssessment");
vi.mock("@/hooks/assessments/useDimensionAssessments");
vi.mock("@/utils/gapCalculation");
vi.mock("@/components/assessment/answering/DimensionAssessmentAnswer", () => ({
  DimensionAssessmentAnswer: vi.fn(({ onSubmit, existingAssessment }) => (
    <div data-testid="dimension-assessment-answer">
      DimensionAssessmentAnswer
      <button onClick={() => onSubmit(1, 2)}>Submit</button>
      {existingAssessment && (
        <span data-testid="existing-assessment">Existing</span>
      )}
    </div>
  )),
}));
vi.mock("@/components/assessment/answering/GapDescriptionDisplay", () => ({
  GapDescriptionDisplay: vi.fn(() => (
    <div data-testid="gap-description-display">GapDescriptionDisplay</div>
  )),
}));
vi.mock("@/components/shared/DimensionIcon", () => ({
  DimensionIcon: vi.fn(() => (
    <div data-testid="dimension-icon">DimensionIcon</div>
  )),
}));
vi.mock("@mui/material", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn(() => ({
      breakpoints: {
        down: vi.fn().mockReturnValue("sm"),
      },
    })),
    // Mock other MUI components if they are causing issues or need specific behavior
    Snackbar: vi.fn(({ open, children }) =>
      open ? <div data-testid="snackbar">{children}</div> : null,
    ),
    Alert: vi.fn(({ children }) => <div data-testid="alert">{children}</div>),
  };
});

// Mock implementations
const mockUseParams = useParams as Mock;
const mockUseNavigate = useNavigate as Mock;
const mockUseLocation = useLocation as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockUseAssessment = useAssessment as Mock;
const mockUseDimensionWithStates = useDimensionWithStates as Mock;
const mockUseSubmitDimensionAssessment = useSubmitDimensionAssessment as Mock;
const mockUseDimensionAssessments = useDimensionAssessments as Mock;
const mockCalculateGapScore = calculateGapScore as Mock;

const mockDimension = {
  id: "dim1",
  name: "Test Dimension",
  description: "Description",
  current_states: [
    { id: "cs1", level: 1, description: "Current State 1" },
    { id: "cs2", level: 2, description: "Current State 2" },
  ],
  desired_states: [
    { id: "ds1", level: 1, description: "Desired State 1" },
    { id: "ds2", level: 2, description: "Desired State 2" },
  ],
};

const mockAssessment = {
  id: "assess1",
  dimensionIds: ["dim1", "dim2"],
};

const mockUser = {
  roles: ["user"],
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <AnswerDimensionAssessmentPage />
    </BrowserRouter>,
  );

describe("AnswerDimensionAssessmentPage", () => {
  let navigateMock: Mock;

  beforeEach(() => {
    navigateMock = vi.fn();
    mockUseParams.mockReturnValue({
      assessmentId: "assess1",
      dimensionId: "dim1",
    });
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseLocation.mockReturnValue({
      state: {},
      pathname: "/user/assessment/assess1/dimension/dim1",
    });
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseOrganizationId.mockReturnValue("org1");
    mockUseCooperationId.mockReturnValue(null);
    mockUseAssessment.mockReturnValue({ data: mockAssessment });
    mockUseDimensionWithStates.mockReturnValue({
      data: mockDimension,
      isLoading: false,
      error: null,
    });
    mockUseSubmitDimensionAssessment.mockReturnValue({ mutateAsync: vi.fn() });
    mockUseDimensionAssessments.mockReturnValue({ data: [] });
    mockCalculateGapScore.mockReturnValue(10); // Mock a default gap score
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading spinner when dimension data is loading", () => {
    mockUseDimensionWithStates.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    renderComponent();
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  test("renders error message when dimension data fails to load", () => {
    const error = new Error("Dimension load failed");
    mockUseDimensionWithStates.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: error,
    });
    renderComponent();
    expect(
      screen.getByText(/Failed to load dimension details/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Dimension load failed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Back to Assessment/i }),
    ).toBeInTheDocument();
  });

  test("renders dimension assessment answer component", () => {
    renderComponent();
    expect(
      screen.getByTestId("dimension-assessment-answer"),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Dimension Assessment")).toBeInTheDocument();
  });

  test("submits assessment successfully and shows gap description", async () => {
    const mockMutateAsync = vi.fn((_payload, { onSuccess }) => {
      onSuccess({ gap_id: "gap123" });
      return Promise.resolve({ gap_id: "gap123" });
    });
    mockUseSubmitDimensionAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          assessmentId: "assess1",
          dimensionId: "dim1",
          currentStateId: "cs1",
          desiredStateId: "ds2",
          gapScore: 10,
          currentLevel: 1,
          desiredLevel: 2,
          organizationId: "org1",
          cooperationId: null,
          userRoles: ["user"],
        }),
        expect.any(Object),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("gap-description-display")).toBeInTheDocument();
    });
  });

  test("shows error snackbar on submission failure", async () => {
    const errorMessage = "Submission failed";
    // Mock mutateAsync to return a promise that rejects, and immediately catch it
    // to prevent "Unhandled Rejection" warnings in tests.
    const mockMutateAsync = vi
      .fn()
      .mockImplementation((_payload, { onError }) => {
        const error = new Error(errorMessage);
        onError(error);
        return Promise.reject(error).catch(() => {});
      });
    mockUseSubmitDimensionAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId("snackbar")).toBeInTheDocument();
    });
  });

  test("navigates back to assessment detail page when 'Back to Assessment' is clicked from error state", () => {
    mockUseDimensionWithStates.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Dimension load failed"),
    });
    renderComponent();
    fireEvent.click(
      screen.getByRole("button", { name: /Back to Assessment/i }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/user/assessment/assess1");
  });

  test("navigates to the next dimension on 'Continue' click", async () => {
    const mockMutateAsync = vi.fn((_payload, { onSuccess }) => {
      onSuccess({ gap_id: "gap123" });
      return Promise.resolve({ gap_id: "gap123" });
    });
    mockUseSubmitDimensionAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    mockUseAssessment.mockReturnValue({
      data: { ...mockAssessment, dimensionIds: ["dim1", "dim2"] },
    });

    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByTestId("gap-description-display")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("continue-button"));
    expect(navigateMock).toHaveBeenCalledWith(
      "/user/assessment/assess1/dimension/dim2",
    );
  });

  test("navigates to finish assessment on 'Finish Assessment' click for last dimension", async () => {
    const mockMutateAsync = vi.fn((_payload, { onSuccess }) => {
      onSuccess({ gap_id: "gap123" });
      return Promise.resolve({ gap_id: "gap123" });
    });
    mockUseSubmitDimensionAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    mockUseParams.mockReturnValue({
      assessmentId: "assess1",
      dimensionId: "dim2",
    }); // Mock as last dimension
    mockUseAssessment.mockReturnValue({
      data: { ...mockAssessment, dimensionIds: ["dim1", "dim2"] },
    });

    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByTestId("gap-description-display")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("finish-assessment-button"));
    expect(navigateMock).toHaveBeenCalledWith("/user/assessment/assess1");
  });

  test("renders existing assessment data if available", () => {
    mockUseDimensionAssessments.mockReturnValue({
      data: [{ dimensionId: "dim1", currentLevel: 1, desiredLevel: 2 }],
    });
    renderComponent();
    expect(screen.getByTestId("existing-assessment")).toBeInTheDocument();
  });

  test("handleBack navigates to assessment list if no assessmentId", () => {
    mockUseParams.mockReturnValue({
      assessmentId: undefined,
      dimensionId: "dim1",
    });
    mockUseDimensionWithStates.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Dimension load failed"), // Simulate error to render the back button
    });
    renderComponent();
    fireEvent.click(
      screen.getByRole("button", { name: /Back to Assessment/i }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/user/assessments");
  });
});
