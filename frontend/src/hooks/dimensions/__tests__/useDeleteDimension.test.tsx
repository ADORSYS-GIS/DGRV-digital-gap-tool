import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useDeleteDimension } from "../useDeleteDimension";
import { db } from "@/services/db";
import { Table } from "dexie";

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

describe("useDeleteDimension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Mock the transaction
    (db.transaction as Mock).mockImplementation(async (...args) => {
      const tx = args[args.length - 1];
      return await tx();
    });
  });

  it("should delete a dimension successfully", async () => {
    (db.dimensions.delete as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.dimensions.delete).toHaveBeenCalledTimes(1);
    expect(db.dimensions.delete).toHaveBeenCalledWith("1");
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when deleting a dimension", async () => {
    const errorMessage = "Failed to delete dimension";
    (db.dimensions.delete as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
