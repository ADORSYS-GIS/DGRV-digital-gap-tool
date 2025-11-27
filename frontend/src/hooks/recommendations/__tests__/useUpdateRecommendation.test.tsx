import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query"; // Keep this import for typing the mock
import { useUpdateRecommendation } from "../useUpdateRecommendation";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import {
  IRecommendation,
  IUpdateRecommendationRequest,
  RecommendationPriority,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

vi.mock("@/services/recommendations/recommendationRepository", () => ({
  recommendationRepository: {
    update: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...(actual as object),
    useQueryClient: vi.fn(),
  };
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateRecommendation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Set the mocked useQueryClient to return our queryClient instance
    (useQueryClient as Mock).mockReturnValue(queryClient);
    // Spy on queryClient methods *after* the mock is set up
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "getQueryData").mockImplementation(() => []);
    vi.spyOn(queryClient, "setQueryData").mockImplementation(() => {});
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call recommendationRepository.update and show success toast on successful update", async () => {
    const mockPayload: IUpdateRecommendationRequest = {
      id: "rec-1",
      description: "Updated Description",
      priority: "MEDIUM",
    };
    (recommendationRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateRecommendation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendationRepository.update).toHaveBeenCalledWith(
      mockPayload.id,
      { description: mockPayload.description, priority: mockPayload.priority },
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Recommendation updated successfully",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["recommendations"],
    });
  });

  it("should optimistically update recommendation in cache", async () => {
    const previousRecommendations: IRecommendation[] = [
      {
        id: "rec-1",
        recommendation_id: "rec-1",
        dimension_id: "dim-1",
        description: "Original Description",
        priority: "LOW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousRecommendations);

    const mockPayload: IUpdateRecommendationRequest = {
      id: "rec-1",
      description: "Optimistic Update Description",
      priority: "HIGH",
    };
    (recommendationRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateRecommendation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    // Wait for the optimistic update to complete before asserting cancelQueries
    await waitFor(() => {
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["recommendations"],
        expect.any(Function),
      );
    });

    const setQueryDataCalls = (queryClient.setQueryData as Mock).mock.calls;
    expect(setQueryDataCalls.length).toBeGreaterThan(0);
    const setQueryDataCall = setQueryDataCalls[0];
    if (!setQueryDataCall) {
      throw new Error("setQueryData was not called with expected arguments.");
    }
    const updaterFunction = setQueryDataCall[1];
    expect(updaterFunction).toBeInstanceOf(Function); // Ensure it's a function
    const updatedRecommendations = updaterFunction(previousRecommendations);

    expect(updatedRecommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "rec-1",
          description: "Optimistic Update Description",
          priority: "HIGH",
          syncStatus: SyncStatus.PENDING,
        }),
      ]),
    );

    expect(queryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: ["recommendations"],
    });
  });

  it("should revert optimistic update and show error toast on failure", async () => {
    const error = new Error("Failed to update recommendation");
    (recommendationRepository.update as Mock).mockRejectedValue(error);

    const previousRecommendations: IRecommendation[] = [
      {
        id: "rec-1",
        recommendation_id: "rec-1",
        dimension_id: "dim-1",
        description: "Original Description",
        priority: "LOW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousRecommendations);

    const mockPayload: IUpdateRecommendationRequest = {
      id: "rec-1",
      description: "Failing Update Description",
      priority: "MEDIUM",
    };

    const { result } = renderHook(() => useUpdateRecommendation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["recommendations"],
      previousRecommendations,
    );
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to update recommendation: ${error.message}`,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["recommendations"],
    });
  });
});
