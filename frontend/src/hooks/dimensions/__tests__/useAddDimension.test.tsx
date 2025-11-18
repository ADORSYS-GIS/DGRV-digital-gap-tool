import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useAddDimension } from "../useAddDimension";
import { ICreateDimensionRequest } from "@/types/dimension";
import { db } from "@/services/db";

// Mock the db
vi.mock("@/services/db", async () => {
  const { mockDb } = await import("../../../test/mocks/db");
  return { db: mockDb };
});

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

const newDimension: ICreateDimensionRequest = {
  name: "New Dimension",
  description: "New Description",
  weight: 0.5,
};

describe("useAddDimension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should add a dimension successfully", async () => {
    (db.dimensions.add as Mock).mockResolvedValue("1");
    (db.sync_queue.add as Mock).mockResolvedValue("1");

    const { result } = renderHook(() => useAddDimension(), { wrapper });

    result.current.mutate(newDimension);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(db.dimensions.add).toHaveBeenCalledWith(
      expect.objectContaining(newDimension),
    );
    expect(db.sync_queue.add).toHaveBeenCalled();
  });

  it("should handle errors when adding a dimension", async () => {
    const errorMessage = "Failed to add dimension";
    (db.dimensions.add as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAddDimension(), { wrapper });

    result.current.mutate(newDimension);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
