import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDimensionAssessments } from "../useDimensionAssessments";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";

vi.mock("@/services/assessments/dimensionAssessmentRepository", () => ({
  dimensionAssessmentRepository: {
    getByAssessment: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDimensionAssessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return an empty array and not call the repository if no assessmentId is provided", async () => {
    const { result } = renderHook(() => useDimensionAssessments(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetched).toBe(false);
    expect(
      dimensionAssessmentRepository.getByAssessment,
    ).not.toHaveBeenCalled();
  });

  it("should fetch dimension assessments by assessmentId", async () => {
    const mockDimensionAssessments = [{ id: "1", name: "Dim Assessment 1" }];
    (dimensionAssessmentRepository.getByAssessment as Mock).mockResolvedValue(
      mockDimensionAssessments,
    );

    const { result } = renderHook(
      () => useDimensionAssessments("assessment-1"),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDimensionAssessments);
    expect(dimensionAssessmentRepository.getByAssessment).toHaveBeenCalledWith(
      "assessment-1",
    );
  });

  it("should handle error when fetching dimension assessments", async () => {
    (dimensionAssessmentRepository.getByAssessment as Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(
      () => useDimensionAssessments("assessment-1"),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
