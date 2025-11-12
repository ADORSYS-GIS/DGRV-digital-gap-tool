import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useUpdateDigitalisationLevel } from "../useUpdateDigitalisationLevel";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { db } from "@/services/db";

// Mock the db module

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

const levelToUpdate: Partial<IDigitalisationLevel> = {
  state: 2,
};

describe("useUpdateDigitalisationLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Correctly mock the transaction implementation
  });

  it("should update a digitalisation level successfully", async () => {
    // Mock the specific table methods
    (db.digitalisationLevels.get as Mock).mockResolvedValue({
      id: "1",
      dimensionId: "1",
      levelType: "current",
      state: 1,
    });
    (db.digitalisationLevels.update as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useUpdateDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({
      dimensionId: "1",
      levelId: "1",
      levelType: "current",
      changes: levelToUpdate,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.digitalisationLevels.update).toHaveBeenCalledTimes(1);
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when updating a digitalisation level", async () => {
    const errorMessage = "Failed to update level";
    // Mock the update method to reject
    (db.digitalisationLevels.get as Mock).mockResolvedValue({
      id: "1",
      dimensionId: "1",
      levelType: "current",
      state: 1,
    });
    (db.digitalisationLevels.update as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useUpdateDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({
      dimensionId: "1",
      levelId: "1",
      levelType: "current",
      changes: levelToUpdate,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
