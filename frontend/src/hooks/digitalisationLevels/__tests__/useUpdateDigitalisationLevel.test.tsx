import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useUpdateDigitalisationLevel } from "../useUpdateDigitalisationLevel";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { db } from "@/services/db";

// Mock the db module
vi.mock("@/services/db");

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

const levelToUpdate: Partial<DigitalisationLevel> = {
  state: 2,
};

describe("useUpdateDigitalisationLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Correctly mock the transaction implementation
    (db.transaction as Mock).mockImplementation(async (...args) => {
      const tx = args[args.length - 1];
      // The tx function might return a promise, so we await it
      return await tx();
    });
  });

  it("should update a digitalisation level successfully", async () => {
    // Mock the specific table methods
    (db.digitalisationLevels.update as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useUpdateDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({ id: "1", level: levelToUpdate });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.digitalisationLevels.update).toHaveBeenCalledTimes(1);
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when updating a digitalisation level", async () => {
    const errorMessage = "Failed to update level";
    // Mock the update method to reject
    (db.digitalisationLevels.update as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useUpdateDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate({ id: "1", level: levelToUpdate });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
