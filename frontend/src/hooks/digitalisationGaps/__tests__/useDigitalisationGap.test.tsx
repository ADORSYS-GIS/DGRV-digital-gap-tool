import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDigitalisationGap } from "../useDigitalisationGap";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { Gap, IDigitalisationGap } from "@/types/digitalisationGap";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/digitalisationGaps/digitalisationGapRepository", () => ({
  digitalisationGapRepository: {
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

describe("useDigitalisationGap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined if no gapId is provided", async () => {
    const { result } = renderHook(() => useDigitalisationGap(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(digitalisationGapRepository.getById).not.toHaveBeenCalled();
  });

  it("should fetch digitalisation gap by id", async () => {
    const mockGap: IDigitalisationGap = {
      id: "gap-1",
      dimensionId: "dim-1",
      gap_severity: Gap.HIGH,
      scope: "Test Scope",
      syncStatus: SyncStatus.SYNCED,
    };
    (digitalisationGapRepository.getById as Mock).mockResolvedValue(mockGap);

    const { result } = renderHook(() => useDigitalisationGap("gap-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGap);
    expect(digitalisationGapRepository.getById).toHaveBeenCalledWith("gap-1");
  });

  it("should handle error when fetching digitalisation gap", async () => {
    (digitalisationGapRepository.getById as Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useDigitalisationGap("gap-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
