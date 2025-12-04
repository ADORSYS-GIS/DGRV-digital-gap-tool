import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCooperationUsers } from "../useCooperationUsers";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOnlineStatus } from "../../shared/useOnlineStatus";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { CooperationUser } from "@/types/cooperationUser";
import { SyncStatus } from "@/types/sync";

vi.mock("@/hooks/cooperations/useCooperationId", () => ({
  useCooperationId: vi.fn(),
}));

vi.mock("../../shared/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

vi.mock("@/services/cooperationUsers/cooperationUserRepository", () => ({
  cooperationUserRepository: {
    getAllByCooperationId: vi.fn(),
  },
}));

vi.mock("@/services/cooperationUsers/cooperationUserSyncService", () => ({
  cooperationUserSyncService: {
    fetchAndStoreUsers: vi.fn(),
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

describe("useCooperationUsers", () => {
  const mockCooperationId = "coop-123";
  const mockUsers: CooperationUser[] = [
    {
      id: "user-1",
      cooperationId: mockCooperationId,
      email: "test1@example.com",
      username: "testuser1",
      roles: ["member"],
      syncStatus: SyncStatus.SYNCED,
    },
    {
      id: "user-2",
      cooperationId: mockCooperationId,
      email: "test2@example.com",
      username: "testuser2",
      roles: ["admin"],
      syncStatus: SyncStatus.SYNCED,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useCooperationId as Mock).mockReturnValue(mockCooperationId);
    (useOnlineStatus as Mock).mockReturnValue(true); // Default to online
    (cooperationUserSyncService.fetchAndStoreUsers as Mock).mockResolvedValue(
      mockUsers,
    );
    (cooperationUserRepository.getAllByCooperationId as Mock).mockResolvedValue(
      mockUsers,
    );
  });

  it("should return empty array if no cooperationId is provided", async () => {
    (useCooperationId as Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useCooperationUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(
      cooperationUserSyncService.fetchAndStoreUsers,
    ).not.toHaveBeenCalled();
    expect(
      cooperationUserRepository.getAllByCooperationId,
    ).not.toHaveBeenCalled();
  });

  describe("When Online", () => {
    beforeEach(() => {
      (useOnlineStatus as Mock).mockReturnValue(true);
    });

    it("should fetch users from cooperationUserSyncService when online", async () => {
      const { result } = renderHook(() => useCooperationUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUsers);
      expect(
        cooperationUserSyncService.fetchAndStoreUsers,
      ).toHaveBeenCalledWith(mockCooperationId);
      expect(
        cooperationUserRepository.getAllByCooperationId,
      ).not.toHaveBeenCalled();
    });

    it("should handle error from cooperationUserSyncService when online", async () => {
      const error = new Error("Failed to fetch online users");
      (cooperationUserSyncService.fetchAndStoreUsers as Mock).mockRejectedValue(
        error,
      );

      const { result } = renderHook(() => useCooperationUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe("When Offline", () => {
    beforeEach(() => {
      (useOnlineStatus as Mock).mockReturnValue(false);
    });

    it("should fetch users from cooperationUserRepository when offline", async () => {
      const { result } = renderHook(() => useCooperationUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUsers);
      expect(
        cooperationUserRepository.getAllByCooperationId,
      ).toHaveBeenCalledWith(mockCooperationId);
      expect(
        cooperationUserSyncService.fetchAndStoreUsers,
      ).not.toHaveBeenCalled();
    });

    it("should handle error from cooperationUserRepository when offline", async () => {
      const error = new Error("Failed to fetch offline users");
      (
        cooperationUserRepository.getAllByCooperationId as Mock
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useCooperationUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
