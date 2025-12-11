import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAddDigitalisationGap } from "../useAddDigitalisationGap";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import {
  AddDigitalisationGapPayload,
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

vi.mock("@/services/digitalisationGaps/digitalisationGapRepository", () => ({
  digitalisationGapRepository: {
    add: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn(),
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

describe("useAddDigitalisationGap", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;
  const mockDimension: IDimension = {
    id: "dim-1",
    name: "Mock Dimension",
    syncStatus: SyncStatus.SYNCED,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { queryClient: newQueryClient, wrapper: newWrapper } =
      createWrapper();
    queryClient = newQueryClient;
    wrapper = newWrapper;
    queryClient.clear();
    queryClient.setQueryData(["dimensions"], [mockDimension]);
    vi.spyOn(queryClient, "getQueryData").mockImplementation((queryKey) => {
      if (queryKey[0] === "dimensions") {
        return [mockDimension];
      }
      return undefined; // Return undefined for other query keys
    });
    vi.spyOn(queryClient, "cancelQueries");
    vi.spyOn(queryClient, "setQueryData");
    vi.spyOn(queryClient, "invalidateQueries");
    (uuidv4 as Mock).mockReturnValue("mock-uuid");
  });

  it("should call digitalisationGapRepository.add and show success toast on success", async () => {
    const mockPayload: AddDigitalisationGapPayload = {
      dimensionId: "dim-1",
      gap_severity: Gap.HIGH,
      scope: "Test Scope",
    };
    const mockResponse: IDigitalisationGapWithDimension = {
      ...mockPayload,
      id: "gap-1",
      dimensionName: mockDimension.name,
      syncStatus: SyncStatus.SYNCED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (digitalisationGapRepository.add as Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAddDigitalisationGap(), {
      wrapper,
    });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(digitalisationGapRepository.add).toHaveBeenCalledWith(mockPayload);
    expect(toast.success).toHaveBeenCalledWith(
      "Digitalisation gap added successfully.",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });

  it("should optimistically add new gap to cache with PENDING status", async () => {
    const mockPayload: AddDigitalisationGapPayload = {
      dimensionId: "dim-1",
      gap_severity: Gap.MEDIUM,
      scope: "Optimistic Scope",
    };
    (digitalisationGapRepository.add as Mock).mockResolvedValue({
      ...mockPayload,
      id: "gap-optimistic",
      dimensionName: mockDimension.name,
      syncStatus: SyncStatus.SYNCED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useAddDigitalisationGap(), {
      wrapper,
    });

    result.current.mutate(mockPayload);

    await waitFor(() =>
      expect(queryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ["digitalisationGaps"],
      }),
    );
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["digitalisationGaps"],
      expect.arrayContaining([
        expect.objectContaining({
          ...mockPayload,
          id: "mock-uuid",
          dimensionName: mockDimension.name,
          syncStatus: SyncStatus.PENDING,
        }),
      ]),
    );
  });

  it("should revert optimistic update and show error toast on failure", async () => {
    const error = new Error("Failed to add gap");
    (digitalisationGapRepository.add as Mock).mockRejectedValue(error);

    const previousGaps: IDigitalisationGapWithDimension[] = [
      {
        id: "prev-gap-1",
        dimensionId: "dim-prev",
        gap_severity: Gap.LOW,
        scope: "Previous Scope",
        dimensionName: "Previous Dimension",
        syncStatus: SyncStatus.SYNCED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    vi.spyOn(queryClient, "getQueryData").mockImplementationOnce((queryKey) => {
      if (queryKey[0] === "digitalisationGaps") {
        return previousGaps;
      }
      return undefined;
    });

    const { result } = renderHook(() => useAddDigitalisationGap(), {
      wrapper,
    });

    result.current.mutate({
      dimensionId: "dim-1",
      gap_severity: Gap.HIGH,
      scope: "Failing Scope",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["digitalisationGaps"],
      previousGaps,
    );
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to add digitalisation gap: ${error.message}`,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["digitalisationGaps"],
    });
  });

  it("should use 'Optimistic Dimension' if dimension is not found in cache", async () => {
    vi.spyOn(queryClient, "getQueryData").mockImplementationOnce((queryKey) => {
      if (queryKey[0] === "dimensions") {
        return [];
      }
      return undefined;
    });

    const mockPayload: AddDigitalisationGapPayload = {
      dimensionId: "non-existent-dim",
      gap_severity: Gap.HIGH,
      scope: "Scope without dimension",
    };
    (digitalisationGapRepository.add as Mock).mockResolvedValue({
      ...mockPayload,
      id: "gap-no-dim",
      dimensionName: "Optimistic Dimension",
      syncStatus: SyncStatus.SYNCED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useAddDigitalisationGap(), {
      wrapper,
    });

    result.current.mutate(mockPayload);

    await waitFor(() =>
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["digitalisationGaps"],
        expect.arrayContaining([
          expect.objectContaining({
            dimensionName: "Optimistic Dimension",
          }),
        ]),
      ),
    );
  });
});
