/// <reference types="vitest/globals" />
import { Mock, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useAddCooperationUser } from "../useAddCooperationUser";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOnlineStatus } from "../../shared/useOnlineStatus";
import { AddCooperationUser } from "@/types/cooperationUser";

// Mock dependencies
vi.mock("@/services/cooperationUsers/cooperationUserRepository");
vi.mock("@/services/cooperationUsers/cooperationUserSyncService");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("../../shared/useOnlineStatus");

describe("useAddCooperationUser", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    (useCooperationId as Mock).mockReturnValue("cooperation-123");
    (useOnlineStatus as Mock).mockReturnValue(true);
    (cooperationUserRepository.add as Mock).mockResolvedValue({
      id: "new-user-id",
      cooperationId: "cooperation-123",
      email: "test@example.com",
      roles: ["member"],
    });
    (cooperationUserSyncService.add as Mock).mockResolvedValue(undefined);
    vi.spyOn(queryClient, "invalidateQueries");
  });

  it("should add a cooperation user and sync when online", async () => {
    const { result } = renderHook(() => useAddCooperationUser(), { wrapper });

    const newUser: AddCooperationUser = {
      email: "test@example.com",
      roles: ["member"],
    };

    result.current.mutate(newUser);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationUserRepository.add).toHaveBeenCalledWith(
      "cooperation-123",
      newUser,
    );
    expect(cooperationUserSyncService.add).toHaveBeenCalledWith({
      id: "new-user-id",
      cooperationId: "cooperation-123",
      email: "test@example.com",
      roles: ["member"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperationUsers", "cooperation-123"],
    });
  });

  it("should add a cooperation user but not sync when offline", async () => {
    (useOnlineStatus as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useAddCooperationUser(), { wrapper });

    const newUser: AddCooperationUser = {
      email: "test@example.com",
      roles: ["member"],
    };

    result.current.mutate(newUser);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cooperationUserRepository.add).toHaveBeenCalledWith(
      "cooperation-123",
      newUser,
    );
    expect(cooperationUserSyncService.add).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["cooperationUsers", "cooperation-123"],
    });
  });

  it("should handle error when adding a cooperation user", async () => {
    const errorMessage = "Failed to add user";
    (cooperationUserRepository.add as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useAddCooperationUser(), { wrapper });

    const newUser: AddCooperationUser = {
      email: "test@example.com",
      roles: ["member"],
    };

    result.current.mutate(newUser);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(cooperationUserSyncService.add).not.toHaveBeenCalled(); // Should not attempt to sync on add failure
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled(); // Should not invalidate queries on failure
  });

  it("should throw an error if cooperationId is not defined", async () => {
    (useCooperationId as Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useAddCooperationUser(), { wrapper });

    const newUser: AddCooperationUser = {
      email: "test@example.com",
      roles: ["member"],
    };

    result.current.mutate(newUser);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Cooperation ID is not defined");
    expect(cooperationUserRepository.add).not.toHaveBeenCalled();
    expect(cooperationUserSyncService.add).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
