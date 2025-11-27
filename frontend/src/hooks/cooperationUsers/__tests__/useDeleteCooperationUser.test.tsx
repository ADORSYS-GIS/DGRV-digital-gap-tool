import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteCooperationUser } from "../useDeleteCooperationUser";
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
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/services/cooperationUsers/cooperationUserSyncService", () => ({
  cooperationUserSyncService: {
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
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useDeleteCooperationUser", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;
  const mockCooperationId = "coop-123";
  const mockUserId = "user-1";
  const mockUser: CooperationUser = {
    id: mockUserId,
    cooperationId: mockCooperationId,
    email: "test@example.com",
    username: "testuser",
    roles: ["member"],
    syncStatus: SyncStatus.SYNCED,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { queryClient: newQueryClient, wrapper: newWrapper } =
      createWrapper();
    queryClient = newQueryClient;
    wrapper = newWrapper;
    queryClient.clear();
    (useCooperationId as Mock).mockReturnValue(mockCooperationId);
    (useOnlineStatus as Mock).mockReturnValue(true); // Default to online
    (cooperationUserRepository.getById as Mock).mockResolvedValue(mockUser);
    (cooperationUserRepository.delete as Mock).mockResolvedValue(undefined);
    (cooperationUserSyncService.delete as Mock).mockResolvedValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries");
  });

  it("should delete user from local repository and sync service when online", async () => {
    const { result } = renderHook(() => useDeleteCooperationUser(), {
      wrapper,
    });

    result.current.mutate(mockUserId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationUserRepository.getById).toHaveBeenCalledWith(mockUserId);
    expect(cooperationUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    expect(cooperationUserSyncService.delete).toHaveBeenCalledWith(mockUser);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperationUsers", mockCooperationId],
    });
  });

  it("should delete user from local repository only when offline", async () => {
    (useOnlineStatus as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useDeleteCooperationUser(), {
      wrapper,
    });

    result.current.mutate(mockUserId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationUserRepository.getById).toHaveBeenCalledWith(mockUserId);
    expect(cooperationUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    expect(cooperationUserSyncService.delete).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperationUsers", mockCooperationId],
    });
  });

  it("should throw error if user is not found", async () => {
    (cooperationUserRepository.getById as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCooperationUser(), {
      wrapper,
    });

    result.current.mutate(mockUserId);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("User not found"));
    expect(cooperationUserRepository.delete).not.toHaveBeenCalled();
    expect(cooperationUserSyncService.delete).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("should handle error during local repository deletion", async () => {
    const error = new Error("Local delete failed");
    (cooperationUserRepository.delete as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteCooperationUser(), {
      wrapper,
    });

    result.current.mutate(mockUserId);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(cooperationUserSyncService.delete).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("should handle error during sync service deletion when online", async () => {
    const error = new Error("Sync delete failed");
    (cooperationUserSyncService.delete as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteCooperationUser(), {
      wrapper,
    });

    result.current.mutate(mockUserId);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
    expect(cooperationUserRepository.delete).toHaveBeenCalledWith(mockUserId); // Local delete should still happen
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
