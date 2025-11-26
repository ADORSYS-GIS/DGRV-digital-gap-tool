import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSetAssignedDimensions } from "../useSetAssignedDimensions";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { organizationDimensionSyncService } from "@/services/sync/organizationDimensionSyncService";

vi.mock("@/services/organizations/organizationDimensionRepository", () => ({
  organizationDimensionRepository: {
    setAssignedDimensions: vi.fn(),
  },
}));

vi.mock("@/services/sync/organizationDimensionSyncService", () => ({
  organizationDimensionSyncService: {
    syncPendingAssignments: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSetAssignedDimensions", () => {
  const queryClient = new QueryClient();
  const mockOrganizationId = "org-123";

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    (
      organizationDimensionRepository.setAssignedDimensions as Mock
    ).mockResolvedValue(undefined);
    (
      organizationDimensionSyncService.syncPendingAssignments as Mock
    ).mockResolvedValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call organizationDimensionRepository.setAssignedDimensions and invalidate queries on success", async () => {
    const mockDimensionIds = ["dim-1", "dim-2"];

    const { result } = renderHook(
      () => useSetAssignedDimensions(mockOrganizationId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    result.current.mutate(mockDimensionIds);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      organizationDimensionRepository.setAssignedDimensions,
    ).toHaveBeenCalledWith(mockOrganizationId, mockDimensionIds);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["organizationDimensions", mockOrganizationId],
    });
    expect(
      organizationDimensionSyncService.syncPendingAssignments,
    ).toHaveBeenCalled();
  });

  it("should handle error when setting assigned dimensions", async () => {
    const error = new Error("Failed to set dimensions");
    (
      organizationDimensionRepository.setAssignedDimensions as Mock
    ).mockRejectedValue(error);

    const { result } = renderHook(
      () => useSetAssignedDimensions(mockOrganizationId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    result.current.mutate(["dim-1"]);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    expect(
      organizationDimensionSyncService.syncPendingAssignments,
    ).not.toHaveBeenCalled();
  });
});
