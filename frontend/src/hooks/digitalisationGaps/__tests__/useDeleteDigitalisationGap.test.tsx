import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteDigitalisationGap } from "../useDeleteDigitalisationGap";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import {
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

vi.mock("@/services/digitalisationGaps/digitalisationGapRepository", () => ({
  digitalisationGapRepository: {
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteDigitalisationGap", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    queryClient.clear();
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "getQueryData").mockReturnValue([]);
    vi.spyOn(queryClient, "setQueryData").mockReturnValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call digitalisationGapRepository.delete and show success toast on successful deletion", async () => {
    (digitalisationGapRepository.delete as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("gap-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(digitalisationGapRepository.delete).toHaveBeenCalledWith("gap-1");
    expect(toast.success).toHaveBeenCalledWith(
      "Digitalisation gap deleted successfully.",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });

  it("should optimistically remove gap from cache", async () => {
    (digitalisationGapRepository.delete as Mock).mockResolvedValue(undefined);

    const previousGaps: IDigitalisationGapWithDimension[] = [
      {
        id: "gap-1",
        dimensionId: "dim-1",
        gap_severity: Gap.HIGH,
        scope: "Scope 1",
        dimensionName: "Dimension 1",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "gap-2",
        dimensionId: "dim-2",
        gap_severity: Gap.MEDIUM,
        scope: "Scope 2",
        dimensionName: "Dimension 2",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousGaps);

    const { result } = renderHook(() => useDeleteDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync("gap-1");

    await waitFor(() => {
      expect(queryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ["digitalisationGaps"],
      });
    });

    await waitFor(() => {
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["digitalisationGaps"],
        [previousGaps[1]],
      );
    });
  });

  it("should revert optimistic update and show error toast on failure", async () => {
    const error = new Error("Failed to delete gap");
    (digitalisationGapRepository.delete as Mock).mockRejectedValue(error);

    const previousGaps: IDigitalisationGapWithDimension[] = [
      {
        id: "gap-1",
        dimensionId: "dim-1",
        gap_severity: Gap.HIGH,
        scope: "Scope 1",
        dimensionName: "Dimension 1",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousGaps);

    const { result } = renderHook(() => useDeleteDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("gap-1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["digitalisationGaps"],
      previousGaps,
    );
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to delete digitalisation gap: ${error.message}`,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });
});
