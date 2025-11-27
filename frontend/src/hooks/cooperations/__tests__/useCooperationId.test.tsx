import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCooperationId } from "../useCooperationId";
import { useParams } from "react-router-dom";
import { authService } from "@/services/shared/authService";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/services/shared/authService", () => ({
  authService: {
    getCooperationPath: vi.fn(),
  },
}));

vi.mock("@/services/cooperations/cooperationRepository", () => ({
  cooperationRepository: {
    getAll: vi.fn(),
  },
}));

describe("useCooperationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as Mock).mockReturnValue({});
    (authService.getCooperationPath as Mock).mockReturnValue(undefined);
    (cooperationRepository.getAll as Mock).mockResolvedValue([]);
  });

  it("should return cooperationId from URL params if present", async () => {
    (useParams as Mock).mockReturnValue({ cooperationId: "coop-from-url" });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBe("coop-from-url"));
    expect(authService.getCooperationPath).not.toHaveBeenCalled();
    expect(cooperationRepository.getAll).not.toHaveBeenCalled();
  });

  it("should return cooperationId from authService and repository if not in URL params", async () => {
    (authService.getCooperationPath as Mock).mockReturnValue(
      "coop-path-from-token",
    );
    (cooperationRepository.getAll as Mock).mockResolvedValue([
      {
        id: "coop-from-db",
        path: "coop-path-from-token",
        name: "Test Coop",
        description: "",
        domains: [],
        syncStatus: "synced",
      },
    ]);

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBe("coop-from-db"));
    expect(authService.getCooperationPath).toHaveBeenCalled();
    expect(cooperationRepository.getAll).toHaveBeenCalled();
  });

  it("should return undefined if no cooperationId in URL and no path in token", async () => {
    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeUndefined());
    expect(authService.getCooperationPath).toHaveBeenCalled();
    expect(cooperationRepository.getAll).not.toHaveBeenCalled();
  });

  it("should return undefined if no cooperationId in URL, path in token but no match in repository", async () => {
    (authService.getCooperationPath as Mock).mockReturnValue(
      "non-existent-path",
    );
    (cooperationRepository.getAll as Mock).mockResolvedValue([
      {
        id: "coop-from-db",
        path: "another-path",
        name: "Test Coop",
        description: "",
        domains: [],
        syncStatus: "synced",
      },
    ]);

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeUndefined());
    expect(authService.getCooperationPath).toHaveBeenCalled();
    expect(cooperationRepository.getAll).toHaveBeenCalled();
  });

  it("should handle error during cooperation ID resolution", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (authService.getCooperationPath as Mock).mockImplementation(() => {
      throw new Error("Auth service error");
    });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeUndefined());
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error resolving cooperation ID:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("should match by id if path is not available but id matches", async () => {
    (authService.getCooperationPath as Mock).mockReturnValue(
      "coop-id-from-token",
    );
    (cooperationRepository.getAll as Mock).mockResolvedValue([
      {
        id: "coop-id-from-token",
        name: "Test Coop",
        description: "",
        domains: [],
        syncStatus: "synced",
      },
    ]);

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBe("coop-id-from-token"));
    expect(authService.getCooperationPath).toHaveBeenCalled();
    expect(cooperationRepository.getAll).toHaveBeenCalled();
  });
});
