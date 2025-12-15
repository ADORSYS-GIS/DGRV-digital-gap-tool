import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAssessments } from "../useAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    getAll: vi.fn(),
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

describe("useAssessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all assessments", async () => {
    const mockAssessments = [{ id: "1", name: "Assessment 1" }];
    (assessmentRepository.getAll as Mock).mockResolvedValue(mockAssessments);

    const { result } = renderHook(() => useAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAssessments);
    expect(assessmentRepository.getAll).toHaveBeenCalled();
  });

  it("should not fetch assessments if enabled is false", async () => {
    (assessmentRepository.getAll as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAssessments({ enabled: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetched).toBe(false));
    expect(assessmentRepository.getAll).not.toHaveBeenCalled();
  });

  it("should handle error when fetching assessments", async () => {
    (assessmentRepository.getAll as Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
