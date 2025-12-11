import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAddCooperation } from "../useAddCooperation";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/cooperations/cooperationRepository", () => ({
  cooperationRepository: {
    add: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAddCooperation", () => {
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

  it("should call cooperationRepository.add and invalidate queries on success", async () => {
    const mockNewCooperation: Omit<Cooperation, "id" | "syncStatus"> = {
      name: "New Coop",
      description: "Description",
      domains: ["domain1"],
    };
    const mockResponse: Cooperation = {
      ...mockNewCooperation,
      id: "coop-1",
      syncStatus: SyncStatus.SYNCED,
    };
    (cooperationRepository.add as Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAddCooperation("org-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockNewCooperation);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationRepository.add).toHaveBeenCalledWith(
      mockNewCooperation,
      "org-1",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperations"],
    });
  });

  it("should optimistically add new cooperation to cache", async () => {
    const mockNewCooperation: Omit<Cooperation, "id" | "syncStatus"> = {
      name: "Optimistic Coop",
      description: "Optimistic Description",
      domains: [],
    };
    (cooperationRepository.add as Mock).mockResolvedValue({
      ...mockNewCooperation,
      id: "coop-2",
      syncStatus: SyncStatus.SYNCED,
    });

    const { result } = renderHook(() => useAddCooperation("org-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockNewCooperation);

    await waitFor(() => {
      expect(queryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ["cooperations"],
      });
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["cooperations"],
        expect.any(Function),
      );

      const updater = (queryClient.setQueryData as Mock).mock.calls[0][1];
      const updatedData = updater([]);
      expect(updatedData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Optimistic Coop",
            syncStatus: SyncStatus.NEW,
            id: "temp-id",
          }),
        ]),
      );
    });
  });

  it("should revert optimistic update and invalidate queries on error", async () => {
    const error = new Error("Failed to add cooperation");
    (cooperationRepository.add as Mock).mockRejectedValue(error);

    const previousCooperations: Cooperation[] = [
      {
        id: "prev-coop-1",
        name: "Previous Coop",
        description: "",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    vi.spyOn(queryClient, "getQueryData").mockReturnValue(previousCooperations);

    const { result } = renderHook(() => useAddCooperation("org-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      name: "Failing Coop",
      description: "",
      domains: [],
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["cooperations"],
      previousCooperations,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperations"],
    });
  });
});
