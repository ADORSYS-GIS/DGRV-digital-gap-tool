import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteRecommendation } from "../useDeleteRecommendation";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { toast } from "sonner";

vi.mock("@/services/recommendations/recommendationRepository", () => ({
  recommendationRepository: {
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useDeleteRecommendation", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { queryClient: qc, wrapper: w } = createWrapper();
    queryClient = qc;
    wrapper = w;
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call recommendationRepository.delete and show success toast on successful deletion", async () => {
    (recommendationRepository.delete as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecommendation(), { wrapper });

    result.current.mutate("rec-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendationRepository.delete).toHaveBeenCalledWith("rec-1");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["recommendations"],
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Recommendation deleted successfully",
    );
  });

  it("should show error toast on failed deletion", async () => {
    const error = new Error("Failed to delete recommendation");
    (recommendationRepository.delete as Mock).mockRejectedValue(error);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useDeleteRecommendation(), { wrapper });

    result.current.mutate("rec-1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(recommendationRepository.delete).toHaveBeenCalledWith("rec-1");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting recommendation:",
      error,
    );
    expect(toast.error).toHaveBeenCalledWith("Failed to delete recommendation");
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled(); // Invalidate should not be called on error
    consoleErrorSpy.mockRestore();
  });
});
