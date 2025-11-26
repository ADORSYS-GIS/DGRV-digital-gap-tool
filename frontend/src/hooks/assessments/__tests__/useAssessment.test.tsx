import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAssessment } from "../useAssessment";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    getById: vi.fn(),
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

describe("useAssessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined if no assessmentId is provided", async () => {
    const { result } = renderHook(() => useAssessment(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(assessmentRepository.getById).not.toHaveBeenCalled();
  });

  it("should fetch assessment by id", async () => {
    const mockAssessment = { id: "123", name: "Test Assessment" };
    (assessmentRepository.getById as Mock).mockResolvedValue(mockAssessment);

    const { result } = renderHook(() => useAssessment("123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAssessment);
    expect(assessmentRepository.getById).toHaveBeenCalledWith("123");
  });

  it("should handle error when fetching assessment", async () => {
    (assessmentRepository.getById as Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useAssessment("123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
