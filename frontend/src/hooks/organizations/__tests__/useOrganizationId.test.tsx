import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOrganizationId } from "../useOrganizationId";
import { authService } from "@/services/shared/authService";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/services/shared/authService", () => ({
  authService: {
    getOrganizationId: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("useOrganizationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    }); // Default authenticated
    (authService.getOrganizationId as Mock).mockReturnValue("mock-org-id");
  });

  it("should return organizationId when authenticated and not loading", async () => {
    const { result } = renderHook(() => useOrganizationId());

    await waitFor(() => expect(result.current).toBe("mock-org-id"));
    expect(authService.getOrganizationId).toHaveBeenCalled();
  });

  it("should return null when not authenticated", async () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    const { result } = renderHook(() => useOrganizationId());

    await waitFor(() => expect(result.current).toBeNull());
    expect(authService.getOrganizationId).not.toHaveBeenCalled();
  });

  it("should return null when loading", async () => {
    (useAuth as Mock).mockReturnValue({ isAuthenticated: true, loading: true });

    const { result } = renderHook(() => useOrganizationId());

    await waitFor(() => expect(result.current).toBeNull());
    expect(authService.getOrganizationId).not.toHaveBeenCalled();
  });

  it("should update organizationId when auth state changes", async () => {
    let isAuthenticated = false;
    let loading = true;

    (useAuth as Mock).mockImplementation(() => ({ isAuthenticated, loading }));

    const { result, rerender } = renderHook(() => useOrganizationId());

    expect(result.current).toBeNull();
    expect(authService.getOrganizationId).not.toHaveBeenCalled();

    isAuthenticated = true;
    loading = false;
    rerender();

    await waitFor(() => expect(result.current).toBe("mock-org-id"));
    expect(authService.getOrganizationId).toHaveBeenCalled();
  });
});
