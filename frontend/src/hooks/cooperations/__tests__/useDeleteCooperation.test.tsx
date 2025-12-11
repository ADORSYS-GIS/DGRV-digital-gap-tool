import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteCooperation } from "../useDeleteCooperation";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/cooperations/cooperationRepository", () => ({
  cooperationRepository: {
    delete: vi.fn(),
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
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

describe("useDeleteCooperation", () => {
  let queryClient: QueryClient;
  let Wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ Wrapper, queryClient } = createWrapper());
    queryClient.clear();
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    vi.spyOn(queryClient, "getQueryData").mockReturnValue([]);
    vi.spyOn(queryClient, "setQueryData").mockReturnValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  it("should call cooperationRepository.delete and invalidate queries on success", async () => {
    (cooperationRepository.delete as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCooperation("org-1"), {
      wrapper: Wrapper,
    });

    result.current.mutate("coop-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationRepository.delete).toHaveBeenCalledWith(
      "coop-1",
      "org-1",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperations"],
    });
  });

  it("should optimistically remove cooperation from cache", async () => {
    (cooperationRepository.delete as Mock).mockResolvedValue(undefined);

    const previousCooperations: Cooperation[] = [
      {
        id: "coop-1",
        name: "Cooperation 1",
        description: "",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
      {
        id: "coop-2",
        name: "Cooperation 2",
        description: "",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousCooperations);

    const { result } = renderHook(() => useDeleteCooperation("org-1"), {
      wrapper: Wrapper,
    });

    result.current.mutate("coop-1");

    await waitFor(() =>
      expect(queryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ["cooperations"],
      }),
    );
    await waitFor(() =>
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["cooperations"],
        expect.any(Function),
      ),
    );
    await waitFor(() => {
      const setQueryDataCalls = (
        queryClient.setQueryData as Mock
      ).mock.calls.filter((call) => call[0][0] === "cooperations");
      const updater = setQueryDataCalls[0][1];
      const updatedData = updater(previousCooperations);
      expect(updatedData).toEqual([
        {
          id: "coop-2",
          name: "Cooperation 2",
          description: "",
          domains: [],
          syncStatus: SyncStatus.SYNCED,
        },
      ]);
    });
  });

  it("should revert optimistic update and invalidate queries on error", async () => {
    const error = new Error("Failed to delete cooperation");
    (cooperationRepository.delete as Mock).mockRejectedValue(error);

    const previousCooperations: Cooperation[] = [
      {
        id: "coop-1",
        name: "Cooperation 1",
        description: "",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    queryClient.getQueryData = vi.fn().mockReturnValue(previousCooperations);

    const { result } = renderHook(() => useDeleteCooperation("org-1"), {
      wrapper: Wrapper,
    });

    result.current.mutate("coop-1");

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
