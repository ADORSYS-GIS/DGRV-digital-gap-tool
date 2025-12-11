import { render, screen, fireEvent, within } from "@testing-library/react";
import ManageRecommendations from "../ManageRecommendations";
import "@testing-library/jest-dom";
import { useRecommendations } from "@/hooks/recommendations/useRecommendations";
import { AddRecommendationForm } from "@/components/admin/recommendations/AddRecommendationForm";
import { RecommendationList } from "@/components/admin/recommendations/RecommendationList";
import { Mock } from "vitest"; // Import Mock type

// Mock the custom hook and components
vi.mock("@/hooks/recommendations/useRecommendations");
vi.mock("@/components/admin/recommendations/AddRecommendationForm", () => ({
  AddRecommendationForm: vi.fn(() => null), // Mocked component
}));
vi.mock("@/components/admin/recommendations/RecommendationList", () => ({
  RecommendationList: vi.fn(() => null), // Mocked component
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockUseRecommendations = useRecommendations as Mock;
const mockAddRecommendationForm = AddRecommendationForm as Mock;
const mockRecommendationList = RecommendationList as Mock;

describe("ManageRecommendations", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseRecommendations.mockReset();
    mockAddRecommendationForm.mockReset();
    mockRecommendationList.mockReset();
  });

  test("renders the main heading and description", () => {
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    expect(screen.getByText("Manage Recommendations")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add, edit, or remove recommendations for the digital gap assessment",
      ),
    ).toBeInTheDocument();
  });

  test("shows error message when there is an error", () => {
    const errorMessage = "Failed to load recommendations";
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    expect(
      screen.getByText("Error loading recommendations"),
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });

  test("calls refetch when retry button is clicked", () => {
    const mockRefetch = vi.fn();
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Failed to load"),
      refetch: mockRefetch,
    });
    render(<ManageRecommendations />);
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  test("shows empty state when no recommendations are found", () => {
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    expect(screen.getByText("No recommendations found")).toBeInTheDocument();
    expect(
      screen.getByText("Get started by adding a new recommendation"),
    ).toBeInTheDocument();
    const emptyStateContainer = screen
      .getByText("No recommendations found")
      .closest("div");
    expect(
      within(emptyStateContainer!).getByRole("button", {
        name: /Add Recommendation/i,
      }),
    ).toBeInTheDocument();
  });

  test("renders RecommendationList when recommendations are available", () => {
    const mockRecommendations = [{ id: "1", name: "Test Rec" }];
    mockUseRecommendations.mockReturnValue({
      data: mockRecommendations,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    expect(mockRecommendationList).toHaveBeenCalledWith(
      { recommendations: mockRecommendations },
      {},
    );
  });

  test("opens AddRecommendationForm when 'Add Recommendation' button is clicked", () => {
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Add Recommendation/i })[0]!,
    );
    expect(mockAddRecommendationForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
      {},
    );
  });

  test("AddRecommendationForm is initially closed", () => {
    mockUseRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ManageRecommendations />);
    expect(mockAddRecommendationForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: false,
      }),
      {},
    );
  });
});
