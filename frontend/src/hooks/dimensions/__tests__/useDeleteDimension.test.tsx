import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useDeleteDimension } from "../useDeleteDimension";
import { db } from "@/services/db";
import { Table } from "dexie";


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
  });

  it("should delete a dimension successfully", async () => {
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Test Dimension",
    });
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Test Dimension",
    });
    (db.dimensions.update as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.dimensions.update).toHaveBeenCalledTimes(1);
    expect(db.dimensions.update).toHaveBeenCalledWith("1", {
      syncStatus: "PENDING",
    });
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when deleting a dimension", async () => {
    const errorMessage = "Failed to delete dimension";
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Test Dimension",
    });
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Test Dimension",
    });
    (db.dimensions.update as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
