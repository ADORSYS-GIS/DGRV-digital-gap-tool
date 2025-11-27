import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDigitalisationGaps } from "../useDigitalisationGaps";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Gap, IDigitalisationGap } from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/digitalisationGaps/digitalisationGapRepository", () => ({
  digitalisationGapRepository: {
    getAll: vi.fn(),
  },
}));

vi.mock("@/services/dimensions/dimensionRepository", () => ({
  dimensionRepository: {
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

describe("useDigitalisationGaps", () => {
  const mockGaps: IDigitalisationGap[] = [
    {
      id: "gap-1",
      dimensionId: "dim-1",
      gap_severity: Gap.HIGH,
      scope: "Scope 1",
      syncStatus: SyncStatus.SYNCED,
    },
    {
      id: "gap-2",
      dimensionId: "dim-2",
      gap_severity: Gap.MEDIUM,
      scope: "Scope 2",
      syncStatus: SyncStatus.SYNCED,
    },
  ];

  const mockDimensions: IDimension[] = [
    { id: "dim-1", name: "Dimension A", syncStatus: SyncStatus.SYNCED },
    { id: "dim-2", name: "Dimension B", syncStatus: SyncStatus.SYNCED },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (digitalisationGapRepository.getAll as Mock).mockResolvedValue(mockGaps);
    (dimensionRepository.getAll as Mock).mockResolvedValue(mockDimensions);
  });

  it("should fetch and combine digitalisation gaps and dimensions", async () => {
    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      { ...mockGaps[0], dimensionName: "Dimension A" },
      { ...mockGaps[1], dimensionName: "Dimension B" },
    ]);
    expect(digitalisationGapRepository.getAll).toHaveBeenCalled();
    expect(dimensionRepository.getAll).toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("should return empty array if digitalisationGaps are undefined", async () => {
    (digitalisationGapRepository.getAll as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(digitalisationGapRepository.getAll).toHaveBeenCalled();
    expect(dimensionRepository.getAll).toHaveBeenCalled();
  });

  it("should return empty array if dimensions are undefined", async () => {
    (dimensionRepository.getAll as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(digitalisationGapRepository.getAll).toHaveBeenCalled();
    expect(dimensionRepository.getAll).toHaveBeenCalled();
  });

  it("should return 'Unknown Dimension' if a dimension is not found", async () => {
    (dimensionRepository.getAll as Mock).mockResolvedValue([
      {
        id: "another-dim",
        name: "Another Dimension",
        syncStatus: SyncStatus.SYNCED,
      },
    ]);

    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      { ...mockGaps[0], dimensionName: "Unknown Dimension" },
      { ...mockGaps[1], dimensionName: "Unknown Dimension" },
    ]);
  });

  it("should return error if digitalisationGaps fetch fails", async () => {
    const error = new Error("Failed to fetch gaps");
    (digitalisationGapRepository.getAll as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toEqual([]);
  });

  it("should return error if dimensions fetch fails", async () => {
    const error = new Error("Failed to fetch dimensions");
    (dimensionRepository.getAll as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDigitalisationGaps(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toEqual([]);
  });
});
