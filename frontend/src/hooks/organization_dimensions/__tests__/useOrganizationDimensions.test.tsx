import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrganizationDimensions } from "../useOrganizationDimensions";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { organizationDimensionSyncService } from "@/services/sync/organizationDimensionSyncService";
import { OrganizationDimension } from "@/types/organizationDimension";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/organizations/organizationDimensionRepository", () => ({
  organizationDimensionRepository: {
    getDimensionsByOrganizationId: vi.fn(),
  },
}));

vi.mock("@/services/sync/organizationDimensionSyncService", () => ({
  organizationDimensionSyncService: {
    syncOrganizationDimensions: vi.fn(),
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

describe("useOrganizationDimensions", () => {
  const mockOrganizationId = "org-123";
  const mockDimensions: OrganizationDimension[] = [
    {
      id: "org-dim-1",
      organizationId: mockOrganizationId,
      dimensionId: "dim-1",
      syncStatus: SyncStatus.SYNCED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "org-dim-2",
      organizationId: mockOrganizationId,
      dimensionId: "dim-2",
      syncStatus: SyncStatus.SYNCED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (
      organizationDimensionSyncService.syncOrganizationDimensions as Mock
    ).mockResolvedValue(undefined);
    (
      organizationDimensionRepository.getDimensionsByOrganizationId as Mock
    ).mockResolvedValue(mockDimensions);
  });

  it("should return undefined if no organizationId is provided", async () => {
    const { result } = renderHook(() => useOrganizationDimensions(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(
      organizationDimensionSyncService.syncOrganizationDimensions,
    ).not.toHaveBeenCalled();
    expect(
      organizationDimensionRepository.getDimensionsByOrganizationId,
    ).not.toHaveBeenCalled();
  });

  it("should sync and fetch organization dimensions when organizationId is provided", async () => {
    const { result } = renderHook(
      () => useOrganizationDimensions(mockOrganizationId),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDimensions);
    expect(
      organizationDimensionSyncService.syncOrganizationDimensions,
    ).toHaveBeenCalledWith(mockOrganizationId);
    expect(
      organizationDimensionRepository.getDimensionsByOrganizationId,
    ).toHaveBeenCalledWith(mockOrganizationId);
  });

  it("should handle error during synchronization", async () => {
    const error = new Error("Sync failed");
    (
      organizationDimensionSyncService.syncOrganizationDimensions as Mock
    ).mockRejectedValue(error);

    const { result } = renderHook(
      () => useOrganizationDimensions(mockOrganizationId),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(
      organizationDimensionRepository.getDimensionsByOrganizationId,
    ).not.toHaveBeenCalled(); // Should not call repository if sync fails
  });

  it("should handle error during fetching from repository", async () => {
    const error = new Error("Fetch from repository failed");
    (
      organizationDimensionRepository.getDimensionsByOrganizationId as Mock
    ).mockRejectedValue(error);

    const { result } = renderHook(
      () => useOrganizationDimensions(mockOrganizationId),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(
      organizationDimensionSyncService.syncOrganizationDimensions,
    ).toHaveBeenCalledWith(mockOrganizationId);
  });
});
