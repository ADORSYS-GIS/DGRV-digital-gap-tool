import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCooperationId } from "../useCooperationId";
import { useAuth } from "@/context/AuthContext";

// Mock the useAuth hook directly
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("useCooperationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useAuth
    (useAuth as Mock).mockReturnValue({
      user: null,
    });
  });

  it("should return cooperationId from user.cooperation if present", async () => {
    (useAuth as Mock).mockReturnValue({
      user: {
        cooperation: "coop-from-user",
      },
    });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBe("coop-from-user"));
  });

  it("should return null if user is null", async () => {
    (useAuth as Mock).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("should return null if user.cooperation is undefined", async () => {
    (useAuth as Mock).mockReturnValue({
      user: {
        // cooperation is undefined
      },
    });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("should return null if user.cooperation is an empty string", async () => {
    (useAuth as Mock).mockReturnValue({
      user: {
        cooperation: "",
      },
    });

    const { result } = renderHook(() => useCooperationId());

    await waitFor(() => expect(result.current).toBeNull());
  });
});
