import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmitDimensionAssessment } from "../useSubmitDimensionAssessment";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";

vi.mock("@/services/assessments/dimensionAssessmentRepository", () => ({
  dimensionAssessmentRepository: {
    submitAssessment: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSubmitDimensionAssessment", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call dimensionAssessmentRepository.submitAssessment on mutate", async () => {
    const mockPayload = {
      dimensionId: "dim-1",
      assessmentId: "assess-1",
      currentStateId: "current-1",
      desiredStateId: "desired-1",
      gapScore: 50,
      organizationId: "org-1",
      cooperationId: "coop-1",
      currentLevel: 1,
      desiredLevel: 3,
    };
    const mockResponse = { id: "new-dim-assess", ...mockPayload };
    (dimensionAssessmentRepository.submitAssessment as Mock).mockResolvedValue(
      mockResponse,
    );

    const { result } = renderHook(() => useSubmitDimensionAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(dimensionAssessmentRepository.submitAssessment).toHaveBeenCalledWith(
      mockPayload,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["dimensionWithStates", mockPayload.dimensionId],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["assessmentDetails", mockPayload.assessmentId],
    });
  });

  it("should handle error when submitting dimension assessment", async () => {
    const error = new Error("Failed to submit");
    (dimensionAssessmentRepository.submitAssessment as Mock).mockRejectedValue(
      error,
    );

    const { result } = renderHook(() => useSubmitDimensionAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      dimensionId: "dim-1",
      assessmentId: "assess-1",
      currentStateId: "current-1",
      desiredStateId: "desired-1",
      gapScore: 50,
      organizationId: "org-1",
      cooperationId: "coop-1",
      currentLevel: 1,
      desiredLevel: 3,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled(); // Invalidation should not happen on error
  });

  it("should invalidate only dimensionWithStates if assessmentId is not provided", async () => {
    const mockPayload = {
      dimensionId: "dim-1",
      assessmentId: "placeholder-assess-id", // Added placeholder to satisfy interface
      currentStateId: "current-1",
      desiredStateId: "desired-1",
      gapScore: 50,
      organizationId: "org-1",
      cooperationId: null,
      currentLevel: 1,
      desiredLevel: 3,
    };
    const mockResponse = { id: "new-dim-assess", ...mockPayload };
    (dimensionAssessmentRepository.submitAssessment as Mock).mockResolvedValue(
      mockResponse,
    );

    const { result } = renderHook(() => useSubmitDimensionAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["dimensionWithStates", mockPayload.dimensionId],
    });
    expect(queryClient.invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["assessmentDetails", undefined],
    });
  });
});
