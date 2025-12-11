import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCooperations } from "../useCooperations";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/cooperations/cooperationRepository", () => ({
  cooperationRepository: {
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

describe("useCooperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all cooperations successfully", async () => {
    const mockCooperations: Cooperation[] = [
      {
        id: "coop-1",
        name: "Cooperation 1",
        description: "Desc 1",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
      {
        id: "coop-2",
        name: "Cooperation 2",
        description: "Desc 2",
        domains: [],
        syncStatus: SyncStatus.SYNCED,
      },
    ];
    (cooperationRepository.getAll as Mock).mockResolvedValue(mockCooperations);

    const { result } = renderHook(() => useCooperations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCooperations);
    expect(cooperationRepository.getAll).toHaveBeenCalled();
  });

  it("should handle error when fetching cooperations", async () => {
    const error = new Error("Failed to fetch cooperations");
    (cooperationRepository.getAll as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useCooperations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });
});
