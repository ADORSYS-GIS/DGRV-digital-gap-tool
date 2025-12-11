import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDimensionWithStates } from "../useDimensionWithStates";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";

vi.mock("@/services/assessments/dimensionAssessmentRepository", () => ({
  dimensionAssessmentRepository: {
    getDimensionWithStates: vi.fn(),
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

describe("useDimensionWithStates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined and not call the repository if no dimensionId is provided", async () => {
    const { result } = renderHook(() => useDimensionWithStates(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetched).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(
      dimensionAssessmentRepository.getDimensionWithStates,
    ).not.toHaveBeenCalled();
  });

  it("should fetch dimension with states by dimensionId", async () => {
    const mockDimensionWithStates = { id: "1", name: "Dim With States" };
    (
      dimensionAssessmentRepository.getDimensionWithStates as Mock
    ).mockResolvedValue(mockDimensionWithStates);

    const { result } = renderHook(() => useDimensionWithStates("dimension-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDimensionWithStates);
    expect(
      dimensionAssessmentRepository.getDimensionWithStates,
    ).toHaveBeenCalledWith("dimension-1");
  });

  it("should handle error when fetching dimension with states", async () => {
    (
      dimensionAssessmentRepository.getDimensionWithStates as Mock
    ).mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useDimensionWithStates("dimension-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
