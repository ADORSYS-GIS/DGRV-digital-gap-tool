import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useParams } from "react-router-dom";
import UserAssessmentDetailPage from "../AssessmentDetailPage"; // Renamed to avoid conflict with shared/assessments/AssessmentDetailPage
import "@testing-library/jest-dom";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
  };
});
vi.mock("@/services/assessments/assessmentRepository");
vi.mock("@/services/dimensions/dimensionRepository");

// Cast mocked functions to Mock type
const mockUseParams = useParams as Mock;
const mockGetAssessmentById = assessmentRepository.getById as Mock;
const mockGetDimensionsByIds = dimensionRepository.getByIds as Mock;

const mockAssessment = {
  id: "assess1",
  name: "User Digital Gap Assessment",
  dimensionIds: ["dim1", "dim2"],
};

const mockDimensions = [
  { id: "dim1", name: "Dimension X", description: "Description X" },
  { id: "dim2", name: "Dimension Y", description: "Description Y" },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <UserAssessmentDetailPage />
    </BrowserRouter>,
  );

describe("UserAssessmentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ assessmentId: "assess1" });
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
      expect(screen.getByText(mockAssessment.name)).toBeInTheDocument();
      expect(
        screen.getByText(
          "Here are the dimensions assigned to this assessment.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Dimension X")).toBeInTheDocument();
      expect(screen.getByText("Description X")).toBeInTheDocument();
      expect(screen.getByText("Dimension Y")).toBeInTheDocument();
      expect(screen.getByText("Description Y")).toBeInTheDocument();
    });
  });

  test("calls assessmentRepository.getById with correct assessmentId", async () => {
    renderComponent();
    await waitFor(() => {
      expect(mockGetAssessmentById).toHaveBeenCalledWith("assess1");
    });
  });

  test("calls dimensionRepository.getByIds with correct dimensionIds", async () => {
    renderComponent();
    await waitFor(() => {
      expect(mockGetDimensionsByIds).toHaveBeenCalledWith(["dim1", "dim2"]);
    });
  });
});
