import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateCooperation } from "../useUpdateCooperation";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/cooperations/cooperationRepository", () => ({
  cooperationRepository: {
    update: vi.fn(),
  },
}));

describe("useUpdateCooperation", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call cooperationRepository.update and invalidate queries on success", async () => {
    const mockCooperation: Cooperation = {
      id: "coop-1",
      name: "Updated Coop",
      description: "Updated Description",
      domains: ["domain1"],
      syncStatus: SyncStatus.SYNCED,
    };
    (cooperationRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateCooperation("org-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCooperation);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationRepository.update).toHaveBeenCalledWith(
      mockCooperation.id,
      mockCooperation,
      "org-1",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperations"],
    });
  });

  it("should handle error when updating cooperation", async () => {
    const error = new Error("Failed to update cooperation");
    (cooperationRepository.update as Mock).mockRejectedValue(error);

    const mockCooperation: Cooperation = {
      id: "coop-1",
      name: "Failing Coop",
      description: "",
      domains: [],
      syncStatus: SyncStatus.SYNCED,
    };

    const { result } = renderHook(() => useUpdateCooperation("org-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCooperation);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
