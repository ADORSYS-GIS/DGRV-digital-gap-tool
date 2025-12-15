import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  BrowserRouter,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AssessmentDetailPage from "../AssessmentDetailPage";
import "@testing-library/jest-dom";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { toast } from "sonner";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});
vi.mock("@/hooks/assessments/useDimensionAssessments");
vi.mock("@/services/assessments/assessmentRepository");
vi.mock("@/services/dimensions/dimensionRepository");
vi.mock("@/components/shared/DimensionCard", () => ({
  DimensionCard: vi.fn(({ dimension, onClick, isSubmitted }) => (
    <button
      data-testid={`dimension-card-${dimension.id}`}
      onClick={() => onClick(dimension.id)}
      disabled={isSubmitted}
    >
      {dimension.name} {isSubmitted ? "(Submitted)" : ""}
    </button>
  )),
}));
vi.mock("@/components/ui/progress", () => ({
  Progress: vi.fn(({ value }) => (
    <div data-testid="progress-bar" data-value={value}></div>
  )),
}));
vi.mock("sonner");

// Cast mocked functions to Mock type
const mockUseParams = useParams as Mock;
const mockUseNavigate = useNavigate as Mock;
const mockUseLocation = useLocation as Mock;
const mockUseDimensionAssessments = useDimensionAssessments as Mock;
const mockGetAssessmentById = assessmentRepository.getById as Mock;
const mockGetDimensionsByIds = dimensionRepository.getByIds as Mock;
const mockToastError = toast.error as Mock;

const mockAssessment = {
  id: "assess1",
  name: "Digital Gap Assessment",
  dimensionIds: ["dim1", "dim2", "dim3"],
};

const mockDimensions = [
  { id: "dim1", name: "Dimension A" },
  { id: "dim2", name: "Dimension B" },
  { id: "dim3", name: "Dimension C" },
];

const mockDimensionAssessments = [
  { id: "da1", dimensionId: "dim1", assessmentId: "assess1" },
  { id: "da2", dimensionId: "dim2", assessmentId: "assess1" },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <AssessmentDetailPage />
    </BrowserRouter>,
  );

describe("AssessmentDetailPage", () => {
  let navigateMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
    mockUseParams.mockReturnValue({ assessmentId: "assess1" });
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseLocation.mockReturnValue({
      pathname: "/user/assessment/assess1",
      state: {},
    });
    mockUseDimensionAssessments.mockReturnValue({
      data: mockDimensionAssessments,
    });
    mockGetAssessmentById.mockResolvedValue(mockAssessment);
    mockGetDimensionsByIds.mockResolvedValue(mockDimensions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state initially", async () => {
    mockGetAssessmentById.mockReturnValue(new Promise(() => {})); // Never resolve
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders error message if assessment fails to load", async () => {
    mockGetAssessmentById.mockRejectedValue(new Error("Network error"));
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to fetch assessment details."),
      ).toBeInTheDocument();
    });
  });

  test("renders 'Assessment not found' if assessment is null", async () => {
    mockGetAssessmentById.mockResolvedValue(null);
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText("Error: Assessment not found."),
      ).toBeInTheDocument();
    });
  });

  test("renders assessment details and dimension cards", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Digital Gap Assessment")).toBeInTheDocument();
      expect(
        screen.getByText("Welcome to Your Digital Journey"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Assess your cooperative across 3 key digital perspectives./i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Dimension A (Submitted)")).toBeInTheDocument();
      expect(screen.getByText("Dimension B (Submitted)")).toBeInTheDocument();
      expect(screen.getByText("Dimension C")).toBeInTheDocument();
    });
  });

  test("displays correct progress percentage", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("2 of 3")).toBeInTheDocument();
      expect(screen.getByText("67%")).toBeInTheDocument();
      expect(
        parseFloat(
          screen.getByTestId("progress-bar").getAttribute("data-value") || "0",
        ),
      ).toBeCloseTo(66.66666666666667);
    });
  });

  test("marks submitted dimensions as submitted", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Dimension A (Submitted)")).toBeInTheDocument();
      expect(screen.getByText("Dimension B (Submitted)")).toBeInTheDocument();
      expect(
        screen.queryByText("Dimension C (Submitted)"),
      ).not.toBeInTheDocument();
    });
  });

  test("navigates to dimension assessment page on DimensionCard click", async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByText("Dimension C"));
    });
    expect(navigateMock).toHaveBeenCalledWith(
      "/user/assessment/assess1/dimension/dim3",
    );
  });

  test("renders error message if assessmentId is not found", async () => {
    mockUseParams.mockReturnValue({ assessmentId: undefined });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText("Error: Assessment ID not found."),
      ).toBeInTheDocument();
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });
});
