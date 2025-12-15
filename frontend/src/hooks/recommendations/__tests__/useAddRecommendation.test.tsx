import { vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAddRecommendation } from "../useAddRecommendation";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import {
  ICreateRecommendationRequest,
  IRecommendation,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

vi.mock("@/services/recommendations/recommendationRepository", () => ({
  recommendationRepository: {
    add: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper };
};

describe("useAddRecommendation", () => {
  let queryClient: QueryClient;
  let Wrapper: React.ComponentType<{ children: React.ReactNode }>;
  let resolveAddRecommendation: (value: IRecommendation) => void;
  let rejectAddRecommendation: (reason?: unknown) => void;
  const queryCache = new Map();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const renderUtils = createWrapper(queryClient);
    Wrapper = renderUtils.Wrapper;
    queryClient.clear();
    queryCache.clear(); // Clear the mock cache for each test

    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "setQueryData").mockImplementation(
      (queryKey, updater) => {
        const key = JSON.stringify(queryKey);
        const existingData = queryCache.get(key);
        const newData =
          typeof updater === "function" ? updater(existingData) : updater;
        queryCache.set(key, newData);
        return newData;
      },
    );
    vi.spyOn(queryClient, "getQueryData").mockImplementation((queryKey) => {
      const key = JSON.stringify(queryKey);
      return queryCache.get(key);
    });

    // Default mock for recommendationRepository.add to return a pending promise
    vi.mocked(recommendationRepository.add).mockImplementation(
      (_payload: ICreateRecommendationRequest) =>
        new Promise((resolve, reject) => {
          resolveAddRecommendation = resolve;
          rejectAddRecommendation = reject;
        }),
    );
  });

  it("should call recommendationRepository.add and show success toast on success", async () => {
    const mockPayload: ICreateRecommendationRequest = {
      dimension_id: "dim-1",
      priority: "HIGH",
      description: "New Recommendation",
    };
    const mockResponse: IRecommendation = {
      id: "rec-1",
      recommendation_id: "rec-1",
      ...mockPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.SYNCED,
    };
    vi.mocked(recommendationRepository.add).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAddRecommendation(), {
      wrapper: Wrapper,
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(recommendationRepository.add).toHaveBeenCalledWith(mockPayload);
    expect(toast.success).toHaveBeenCalledWith(
      "Recommendation added successfully",
    );
    // Invalidate queries is called implicitly by onSettled, which is not part of this specific test's concern.
    // The onSuccess logic will update the cache directly.
  });

  it("should optimistically add new recommendation to cache", async () => {
    const mockPayload: ICreateRecommendationRequest = {
      dimension_id: "dim-2",
      priority: "MEDIUM",
      description: "Optimistic Recommendation",
    };
    const mockResponse: IRecommendation = {
      id: "rec-optimistic",
      recommendation_id: "rec-optimistic",
      ...mockPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.SYNCED,
    };

    // The mock is already set in beforeEach, so we don't need to re-mock it here.
    // We will use the resolveAddRecommendation exposed in beforeEach.

    const { result } = renderHook(() => useAddRecommendation(), {
      wrapper: Wrapper,
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(queryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ["recommendations"],
      });
    });

    // Assert the optimistic state in the cache
    await waitFor(() => {
      const recommendations = queryClient.getQueryData<IRecommendation[]>([
        "recommendations",
      ]);
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            dimension_id: mockPayload.dimension_id,
            priority: mockPayload.priority,
            description: mockPayload.description,
            syncStatus: SyncStatus.PENDING, // Expect PENDING for optimistic update
          }),
        ]),
      );
    });

    // Resolve the promise from recommendationRepository.add to simulate success
    resolveAddRecommendation(mockResponse);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // After success, the cache should be updated with the SYNCED status
    await waitFor(() => {
      const recommendations = queryClient.getQueryData<IRecommendation[]>([
        "recommendations",
      ]);
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: mockResponse.id,
            recommendation_id: mockResponse.recommendation_id,
            dimension_id: mockPayload.dimension_id,
            priority: mockPayload.priority,
            description: mockPayload.description,
            syncStatus: SyncStatus.SYNCED, // Expect SYNCED after successful API call
          }),
        ]),
      );
    });
  });

  it("should revert optimistic update and show error toast on failure", async () => {
    const error = new Error("Failed to add recommendation");
    // The mock is already set in beforeEach, so we don't need to re-mock it here.
    // We will use the rejectAddRecommendation exposed in beforeEach.

    const previousRecommendations: IRecommendation[] = [
      {
        id: "prev-rec-1",
        recommendation_id: "prev-rec-1",
        dimension_id: "dim-prev",
        priority: "LOW",
        description: "Previous Recommendation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    // Initialize the cache with previous recommendations
    queryClient.setQueryData(["recommendations"], previousRecommendations);

    const { result } = renderHook(() => useAddRecommendation(), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      dimension_id: "dim-fail",
      priority: "HIGH",
      description: "Failing Recommendation",
    });

    // Assert optimistic update (optional, but good for completeness)
    await waitFor(() => {
      const recommendations = queryClient.getQueryData<IRecommendation[]>([
        "recommendations",
      ]);
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            dimension_id: "dim-fail",
            priority: "HIGH",
            description: "Failing Recommendation",
            syncStatus: SyncStatus.PENDING,
          }),
        ]),
      );
    });

    // Reject the promise to simulate failure
    rejectAddRecommendation(error);

    await waitFor(() => expect(result.current.isError).toBe(true));

    await waitFor(() => {
      // Expect the cache to revert to previous recommendations
      expect(queryClient.getQueryData(["recommendations"])).toEqual(
        previousRecommendations,
      );
    });
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to add recommendation: ${error.message}`,
    );
  });

  it("should update optimistic recommendation with actual data on success", async () => {
    const mockPayload: ICreateRecommendationRequest = {
      dimension_id: "dim-3",
      priority: "LOW",
      description: "Successful Recommendation",
    };
    const actualResponse: IRecommendation = {
      id: "actual-rec-id",
      recommendation_id: "actual-rec-id",
      ...mockPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.SYNCED,
    };

    // The mock is already set in beforeEach, so we don't need to re-mock it here.
    // We will use the resolveAddRecommendation exposed in beforeEach.

    const { result } = renderHook(() => useAddRecommendation(), {
      wrapper: Wrapper,
    });

    result.current.mutate(mockPayload);

    // Assert optimistic update
    await waitFor(() => {
      const recommendations = queryClient.getQueryData<IRecommendation[]>([
        "recommendations",
      ]);
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            dimension_id: mockPayload.dimension_id,
            priority: mockPayload.priority,
            description: mockPayload.description,
            syncStatus: SyncStatus.PENDING,
          }),
        ]),
      );
    });

    // Resolve the promise from recommendationRepository.add
    resolveAddRecommendation(actualResponse);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await waitFor(() => {
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["recommendations"],
        expect.any(Function), // Expect an updater function to merge
      );
    });

    await waitFor(() => {
      expect(
        (
          queryClient.getQueryData(["recommendations"]) as IRecommendation[]
        ).find((r) => r.id === actualResponse.id),
      ).toEqual(actualResponse);
    });
  });
});
