import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRecommendations } from "../useRecommendations";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { IRecommendation } from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/recommendations/recommendationRepository", () => ({
  recommendationRepository: {
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

describe("useRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all recommendations successfully", async () => {
    const mockRecommendations: IRecommendation[] = [
      {
        id: "rec-1",
        dimension_id: "dim-1",
        description: "Rec 1",
        priority: "HIGH",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.SYNCED,
      },
      {
        id: "rec-2",
        dimension_id: "dim-2",
        description: "Rec 2",
        priority: "MEDIUM",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    (recommendationRepository.getAll as Mock).mockResolvedValue(
      mockRecommendations,
    );

    const { result } = renderHook(() => useRecommendations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRecommendations);
    expect(recommendationRepository.getAll).toHaveBeenCalled();
  });

  it("should handle error when fetching recommendations", async () => {
    const error = new Error("Failed to fetch recommendations");
    (recommendationRepository.getAll as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useRecommendations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });
});
