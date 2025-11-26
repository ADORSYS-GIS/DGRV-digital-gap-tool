import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateDigitalisationGap } from "../useUpdateDigitalisationGap";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import {
  Gap,
  IDigitalisationGapWithDimension,
  UpdateDigitalisationGapPayload,
} from "@/types/digitalisationGap";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

vi.mock("@/services/digitalisationGaps/digitalisationGapRepository", () => ({
  digitalisationGapRepository: {
    update: vi.fn(),
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

describe("useUpdateDigitalisationGap", () => {
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
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "getQueryData").mockReturnValue([]);
    vi.spyOn(queryClient, "setQueryData").mockReturnValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call digitalisationGapRepository.update and show success toast on successful update", async () => {
    const mockPayload: UpdateDigitalisationGapPayload = {
      id: "gap-1",
      scope: "Updated Scope",
    };
    (digitalisationGapRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(digitalisationGapRepository.update).toHaveBeenCalledWith(
      mockPayload.id,
      { scope: mockPayload.scope },
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Digitalisation gap updated successfully.",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });

  it("should optimistically update gap in cache", async () => {
    const previousGaps: IDigitalisationGapWithDimension[] = [
      {
        id: "gap-1",
        dimensionId: "dim-1",
        gap_severity: Gap.HIGH,
        scope: "Original Scope",
        dimensionName: "Dimension 1",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    vi.spyOn(queryClient, "getQueryData").mockReturnValue(previousGaps);

    const mockPayload: UpdateDigitalisationGapPayload = {
      id: "gap-1",
      scope: "Optimistic Update Scope",
    };
    (digitalisationGapRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(mockPayload);

    expect(queryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["digitalisationGaps"],
      expect.arrayContaining([
        expect.objectContaining({
          id: "gap-1",
          scope: "Optimistic Update Scope",
        }),
      ]),
    );
  });

  it("should revert optimistic update and show error toast on failure", async () => {
    const error = new Error("Failed to update gap");
    (digitalisationGapRepository.update as Mock).mockRejectedValue(error);

    const previousGaps: IDigitalisationGapWithDimension[] = [
      {
        id: "gap-1",
        dimensionId: "dim-1",
        gap_severity: Gap.HIGH,
        scope: "Original Scope",
        dimensionName: "Dimension 1",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousGaps);

    const mockPayload: UpdateDigitalisationGapPayload = {
      id: "gap-1",
      scope: "Failing Update Scope",
    };

    const { result } = renderHook(() => useUpdateDigitalisationGap(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["digitalisationGaps"],
      previousGaps,
    );
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to update digitalisation gap: ${error.message}`,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });
});
