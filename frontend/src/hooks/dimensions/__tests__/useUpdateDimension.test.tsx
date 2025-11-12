import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useUpdateDimension } from "../useUpdateDimension";
import { IDimension } from "@/types/dimension";
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

const dimensionToUpdate: Partial<IDimension> = {
  name: "Updated Dimension",
};

describe("useUpdateDimension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should update a dimension successfully", async () => {
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Old Dimension",
    });
    (db.dimensions.update as Mock).mockResolvedValue(1);
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useUpdateDimension(), { wrapper });

    result.current.mutate({ id: "1", dimension: dimensionToUpdate });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.dimensions.update).toHaveBeenCalledTimes(1);
    expect(db.sync_queue.add).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when updating a dimension", async () => {
    const errorMessage = "Failed to update dimension";
    (db.dimensions.get as Mock).mockResolvedValue({
      id: "1",
      name: "Old Dimension",
    });
    (db.dimensions.update as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUpdateDimension(), { wrapper });

    result.current.mutate({ id: "1", dimension: dimensionToUpdate });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
