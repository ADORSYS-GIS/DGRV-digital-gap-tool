import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "../useOnlineStatus";
import { vi } from "vitest";

describe("useOnlineStatus", () => {
  const dispatchOnlineEvent = () => {
    window.dispatchEvent(new Event("online"));
  };

  const dispatchOfflineEvent = () => {
    window.dispatchEvent(new Event("offline"));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, "onLine", { value: true, writable: true });
  });

  it("should return initial online status", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("should update status to false when offline event is dispatched", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      dispatchOfflineEvent();
    });

    expect(result.current).toBe(false);
  });

  it("should update status to true when online event is dispatched", () => {
    // Start offline for this test
    Object.defineProperty(navigator, "onLine", {
      value: false,
      writable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      dispatchOnlineEvent();
    });

    expect(result.current).toBe(true);
  });

  it("should remove event listeners on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOnlineStatus());

    expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
  });
});
