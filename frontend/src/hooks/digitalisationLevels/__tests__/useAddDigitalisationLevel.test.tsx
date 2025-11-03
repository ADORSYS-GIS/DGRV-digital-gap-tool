import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useAddDigitalisationLevel } from "../useAddDigitalisationLevel";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { db } from "@/services/db";

// Mock the db
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

const newLevel: Omit<
  DigitalisationLevel,
  "id" | "syncStatus" | "lastModified"
> = {
  dimensionId: "1",
  levelType: "current",
  state: 1,
  scope: "test",
};

describe("useAddDigitalisationLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Mock the transaction
    (db.transaction as Mock).mockImplementation(async (...args) => {
      const tx = args[args.length - 1];
      return await tx();
    });
  });

  it("should add a digitalisation level successfully", async () => {
    (db.digitalisationLevels.add as Mock).mockResolvedValue("1");
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useAddDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate(newLevel);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.digitalisationLevels.add).toHaveBeenCalledWith(
      expect.objectContaining(newLevel),
    );
    expect(db.sync_queue.add).toHaveBeenCalled();
  });

  it("should handle errors when adding a digitalisation level", async () => {
    const errorMessage = "Failed to add level";
    (db.digitalisationLevels.add as Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useAddDigitalisationLevel(), {
      wrapper,
    });

    result.current.mutate(newLevel);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
