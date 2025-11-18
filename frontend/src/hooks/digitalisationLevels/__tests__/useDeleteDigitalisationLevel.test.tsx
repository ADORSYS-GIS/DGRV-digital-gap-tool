import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useDeleteDigitalisationLevel } from "../useDeleteDigitalisationLevel";
import { db } from "@/services/db";
import { Table } from "dexie";

// Mock the db

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useDeleteDigitalisationLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Mock the transaction
  });

  it("should delete a digitalisation level successfully", async () => {
    (db.digitalisationLevels.get as Mock).mockResolvedValue({
      id: "1",
      dimensionId: "1",
      levelType: "current",
      state: 1,
    });
    (db.digitalisationLevels.delete as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useDeleteDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({
      dimensionId: "1",
      levelId: "1",
      levelType: "current",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.digitalisationLevels.delete).toHaveBeenCalledTimes(1);
    expect(db.digitalisationLevels.delete).toHaveBeenCalledWith("1");
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when deleting a digitalisation level", async () => {
    const errorMessage = "Failed to delete level";
    (db.digitalisationLevels.get as Mock).mockResolvedValue({
      id: "1",
      dimensionId: "1",
      levelType: "current",
      state: 1,
    });
    (db.digitalisationLevels.delete as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useDeleteDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({
      dimensionId: "1",
      levelId: "1",
      levelType: "current",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
